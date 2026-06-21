import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const UID_COOKIE = "dtot_uid";
const ONE_YEAR = 60 * 60 * 24 * 365;

/** Returns the signed-in candidate, or null. Works in RSC and route handlers. */
export async function getCurrentUser() {
  const id = cookies().get(UID_COOKIE)?.value;
  if (!id) return null;
  const user = await prisma.user.findUnique({ where: { id } });
  return user;
}

export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

/** Find-or-create a candidate by name (lightweight local auth) and set cookie. */
export async function signIn(name: string, email?: string) {
  const trimmed = name.trim() || "Candidate";
  const user = await prisma.user.create({
    data: { name: trimmed, email: email?.trim() || null },
  });
  cookies().set(UID_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR,
  });
  return user;
}

export async function setSessionCookie(userId: string) {
  cookies().set(UID_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR,
  });
}

export function clearSessionCookie() {
  cookies().delete(UID_COOKIE);
}
