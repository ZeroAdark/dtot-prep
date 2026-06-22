import { cookies } from "next/headers";
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { prisma } from "./prisma";

// Async scrypt: the sync variant blocks the single Node event loop for the full
// (deliberately expensive) hash, so every login/register would stall the whole
// app. The promisified version runs the work on libuv's threadpool instead.
const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
) => Promise<Buffer>;

export const SESSION_COOKIE = "dtot_session";
const SESSION_TTL_DAYS = 30;
const SESSION_TTL_SEC = SESSION_TTL_DAYS * 24 * 60 * 60;
export const MIN_PASSWORD_LENGTH = 8;
// Cap the accepted password length. scrypt first runs PBKDF2 over the whole
// input, so an unbounded password lets an attacker make each (blocking) hash
// arbitrarily expensive — a cheap DoS. 256 is far longer than any real
// passphrase.
export const MAX_PASSWORD_LENGTH = 256;

// ── Password hashing (Node built-in scrypt — no external deps) ────────────────
// Stored format: "scrypt$<saltHex>$<hashHex>".
const SCRYPT_KEYLEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, SCRYPT_KEYLEN)).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export async function verifyPassword(
  password: string,
  stored: string | null,
): Promise<boolean> {
  if (!stored) return false;
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  // Fail CLOSED on any malformed hash: it must be valid hex decoding to exactly
  // the scrypt key length. (Otherwise a bad hash could decode to 0 bytes and a
  // 0-length comparison would match any password.) Never derive the key length
  // from the stored value — pin it to the constant used when hashing.
  if (!/^[0-9a-fA-F]+$/.test(hash)) return false;
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== SCRYPT_KEYLEN) return false;
  let actual: Buffer;
  try {
    actual = await scrypt(password, salt, SCRYPT_KEYLEN);
  } catch {
    return false;
  }
  return timingSafeEqual(expected, actual);
}

// A fixed dummy hash, computed once. login() verifies against it on the
// "no such user" / "no password set" paths so a failed attempt always pays the
// same scrypt cost as a real one — removing the timing oracle that would
// otherwise reveal which names are registered.
let dummyHashPromise: Promise<string> | null = null;
function getDummyHash(): Promise<string> {
  if (!dummyHashPromise) {
    dummyHashPromise = hashPassword(randomBytes(32).toString("hex"));
  }
  return dummyHashPromise;
}

// ── Session cookie (random bearer token mapped to a DB Session row) ───────────
export async function setSessionCookie(token: string, secure: boolean) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: SESSION_TTL_SEC,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

async function createSession(userId: string): Promise<string> {
  // Opportunistically garbage-collect expired sessions so the table stays
  // bounded without any scheduled job (expiry is still enforced on every read).
  await prisma.session
    .deleteMany({ where: { expiresAt: { lt: new Date() } } })
    .catch(() => {});
  const token = randomBytes(32).toString("hex"); // 256-bit, unguessable
  const expiresAt = new Date(Date.now() + SESSION_TTL_SEC * 1000);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  // Record activity so a returning user isn't a sweep target.
  await prisma.user
    .update({ where: { id: userId }, data: { lastSeenAt: new Date() } })
    .catch(() => {});
  return token;
}

// How stale lastSeenAt may get before getCurrentUser refreshes it. Throttles the
// write to ~once/hour per active user instead of one per request.
const ACTIVITY_REFRESH_MS = 60 * 60 * 1000;

/**
 * The signed-in candidate (only safe public fields), or null. Read-only — safe
 * to call in RSC. Selects just id+name so passwordHash/email can never leak to
 * any caller (e.g. the GET /api/session response).
 */
export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    select: {
      expiresAt: true,
      user: { select: { id: true, name: true, lastSeenAt: true } },
    },
  });
  if (!session || session.expiresAt.getTime() < Date.now()) return null;

  const { id, name, lastSeenAt } = session.user;
  // Throttled activity bump (drives the inactive-account sweep). Fire-and-forget
  // so it never adds latency to the request.
  if (!lastSeenAt || Date.now() - lastSeenAt.getTime() > ACTIVITY_REFRESH_MS) {
    prisma.user
      .update({ where: { id }, data: { lastSeenAt: new Date() } })
      .catch(() => {});
  }
  return { id, name };
}

export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

// ── Account actions (call from route handlers — they set/clear cookies) ───────

export interface AuthResult {
  ok: boolean;
  error?: string;
  user?: { id: string; name: string };
}

/** Create a new account (name must be unique) and sign in. */
export async function register(
  name: string,
  password: string,
  secure: boolean,
): Promise<AuthResult> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Please enter a name." };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Password must be at most ${MAX_PASSWORD_LENGTH} characters.`,
    };
  }
  let user;
  try {
    user = await prisma.user.create({
      data: { name: trimmed, passwordHash: await hashPassword(password) },
    });
  } catch (e) {
    // Prisma P2002 = unique constraint (name already taken).
    if (e && typeof e === "object" && (e as { code?: string }).code === "P2002") {
      return { ok: false, error: "That name is already taken." };
    }
    throw e;
  }
  const token = await createSession(user.id);
  await setSessionCookie(token, secure);
  return { ok: true, user: { id: user.id, name: user.name } };
}

/** Sign in with name + password. Generic failure (no account enumeration). */
export async function login(
  name: string,
  password: string,
  secure: boolean,
): Promise<AuthResult> {
  const trimmed = name.trim();
  const generic: AuthResult = { ok: false, error: "Incorrect name or password." };
  if (!trimmed || !password || password.length > MAX_PASSWORD_LENGTH) {
    // Still pay the hash cost on obviously-bad input so timing stays flat.
    await verifyPassword(password, await getDummyHash());
    return generic;
  }

  const user = await prisma.user.findUnique({ where: { name: trimmed } });
  // ALWAYS run a scrypt verification — against the real hash if the account
  // exists and has a password, otherwise against a dummy hash — so the response
  // time is the same whether or not the name exists. An account with no password
  // set is never auto-claimed: it simply fails like a wrong password. (There is
  // no "first login wins" path; that was an unauthenticated account-takeover.)
  let ok = false;
  if (user?.passwordHash) {
    ok = await verifyPassword(password, user.passwordHash);
  } else {
    await verifyPassword(password, await getDummyHash());
  }
  if (!user || !ok) return generic;

  const token = await createSession(user.id);
  await setSessionCookie(token, secure);
  return { ok: true, user: { id: user.id, name: user.name } };
}

/** Sign out: revoke the current session and clear the cookie. */
export async function logout() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { token } });
  await clearSessionCookie();
}

/**
 * Delete the signed-in account (re-authenticated with the password). Cascades to
 * the user's sessions, responses, narratives, and study progress.
 */
export async function deleteAccountWithPassword(
  userId: string,
  password: string,
): Promise<boolean> {
  if (!password || password.length > MAX_PASSWORD_LENGTH) return false;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;
  // Fail closed: require a set password and a correct match (never allow
  // deletion of a passwordless account without re-auth).
  if (!user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    return false;
  }
  await prisma.user.delete({ where: { id: userId } });
  await clearSessionCookie();
  return true;
}
