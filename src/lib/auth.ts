import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { prisma } from "./prisma";

export const SESSION_COOKIE = "dtot_session";
const SESSION_TTL_DAYS = 30;
const SESSION_TTL_SEC = SESSION_TTL_DAYS * 24 * 60 * 60;
export const MIN_PASSWORD_LENGTH = 8;

// ── Password hashing (Node built-in scrypt — no external deps) ────────────────
// Stored format: "scrypt$<saltHex>$<hashHex>".
const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string | null): boolean {
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
    actual = scryptSync(password, salt, SCRYPT_KEYLEN);
  } catch {
    return false;
  }
  return timingSafeEqual(expected, actual);
}

// ── Session cookie (random bearer token mapped to a DB Session row) ───────────
export async function setSessionCookie(token: string, secure: boolean) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: SESSION_TTL_SEC,
  });
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}

async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex"); // 256-bit, unguessable
  const expiresAt = new Date(Date.now() + SESSION_TTL_SEC * 1000);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  return token;
}

/**
 * The signed-in candidate (only safe public fields), or null. Read-only — safe
 * to call in RSC. Selects just id+name so passwordHash/email can never leak to
 * any caller (e.g. the GET /api/session response).
 */
export async function getCurrentUser() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    select: { expiresAt: true, user: { select: { id: true, name: true } } },
  });
  if (!session || session.expiresAt.getTime() < Date.now()) return null;
  return session.user;
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
  claimed?: boolean; // a legacy passwordless profile just had its password set
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
  let user;
  try {
    user = await prisma.user.create({
      data: { name: trimmed, passwordHash: hashPassword(password) },
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
  if (!trimmed || !password) return generic;

  const user = await prisma.user.findUnique({ where: { name: trimmed } });
  if (!user) return generic;

  let claimed = false;
  if (!user.passwordHash) {
    // Legacy passwordless profile: first sign-in sets (claims) its password.
    if (password.length < MIN_PASSWORD_LENGTH) {
      return {
        ok: false,
        error: `This profile has no password yet — set one of at least ${MIN_PASSWORD_LENGTH} characters.`,
      };
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(password) },
    });
    claimed = true;
  } else if (!verifyPassword(password, user.passwordHash)) {
    return generic;
  }

  const token = await createSession(user.id);
  await setSessionCookie(token, secure);
  return { ok: true, user: { id: user.id, name: user.name }, claimed };
}

/** Sign out: revoke the current session and clear the cookie. */
export async function logout() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { token } });
  clearSessionCookie();
}

/**
 * Delete the signed-in account (re-authenticated with the password). Cascades to
 * the user's sessions, responses, narratives, and study progress.
 */
export async function deleteAccountWithPassword(
  userId: string,
  password: string,
): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;
  // Fail closed: require a set password and a correct match (never allow
  // deletion of a passwordless account without re-auth).
  if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return false;
  }
  await prisma.user.delete({ where: { id: userId } });
  clearSessionCookie();
  return true;
}
