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

/** A candidate profile with light activity stats for the profile picker. */
export interface ProfileSummary {
  id: string;
  name: string;
  createdAt: string; // ISO — serializable for client components
  tests: number; // test sessions started
  answered: number; // questions answered
  narratives: number; // narratives drafted
}

/** All local candidate profiles, newest first, with activity counts. */
export async function listProfiles(): Promise<ProfileSummary[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: {
        select: { testSessions: true, responses: true, narratives: true },
      },
    },
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    createdAt: u.createdAt.toISOString(),
    tests: u._count.testSessions,
    answered: u._count.responses,
    narratives: u._count.narratives,
  }));
}

/** Sign in as an existing candidate profile. Returns the user, or null if gone. */
export async function loginAs(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  await setSessionCookie(user.id);
  return user;
}

/**
 * Permanently delete a candidate profile and ALL of its data — test sessions,
 * responses, narratives, and study progress all cascade. If the deleted profile
 * is the one currently signed in, the session cookie is cleared too.
 * Returns true if a profile was actually removed.
 */
export async function deleteProfile(userId: string): Promise<boolean> {
  const { count } = await prisma.user.deleteMany({ where: { id: userId } });
  if (cookies().get(UID_COOKIE)?.value === userId) clearSessionCookie();
  return count > 0;
}
