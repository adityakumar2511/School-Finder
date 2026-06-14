import { cookies } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { ADMIN_TOKEN_COOKIE } from "@/lib/auth/admin-auth";
import { mintBackendJwt } from "@/lib/auth/backend-jwt";

/**
 * Resolve the Express-compatible HS256 Bearer token for BFF/SSR calls.
 *
 * Token resolution order:
 * - ADMIN       → sf_admin_token HTTP-only cookie (set at admin login)
 * - SCHOOL_ADMIN → session.backendAccessToken (set at credentials login)
 *                  falls back to mintBackendJwt if token missing from session
 * - PARENT      → session.backendAccessToken
 *                  falls back to mintBackendJwt
 */
export async function resolveBackendToken(
  options: { adminCookieOnly?: boolean } = {}
): Promise<string | null> {
  // Admin-only shortcut (used by adminFetch in server.ts)
  if (options.adminCookieOnly) {
    const cookieStore = await cookies();
    return cookieStore.get(ADMIN_TOKEN_COOKIE)?.value ?? null;
  }

  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return null;
  }

  const { role, id, email } = session.user;
  const cookieStore = await cookies();

  // ADMIN — always use HTTP-only cookie, never mint
  if (role === "ADMIN") {
    return cookieStore.get(ADMIN_TOKEN_COOKIE)?.value ?? null;
  }

  // SCHOOL_ADMIN and PARENT — prefer session token, fallback to minted JWT
  if (role === "SCHOOL_ADMIN" || role === "PARENT") {
    if (
      typeof session.backendAccessToken === "string" &&
      session.backendAccessToken.length > 0
    ) {
      return session.backendAccessToken;
    }

    // Fallback: mint a short-lived HS256 token using shared JWT_SECRET
    // This covers SSR calls where backendAccessToken isn't in session
    return mintBackendJwt({ id, role, email });
  }

  return null;
}