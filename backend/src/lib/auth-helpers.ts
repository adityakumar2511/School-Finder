import prisma from "./prisma";

/**
 * Returns the current tokenVersion for a user, or null if the user
 * no longer exists. Centralised here (not inlined in auth middleware)
 * so that adding a cache layer later only requires changing this file.
 *
 * Current implementation: direct DB read on every call.
 * Future scaling path: wrap with withCache() from lib/cache.ts using a
 * short TTL (30–60s) once request volume justifies it.
 */
export async function getUserTokenVersion(userId: string): Promise<number | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokenVersion: true },
  });

  return user ? user.tokenVersion : null;
}