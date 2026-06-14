import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminApiBase } from "@/lib/auth/admin-auth";
import { ADMIN_TOKEN_COOKIE } from "@/lib/auth/admin-auth";
import { getBackendToken } from "@/lib/api/server";

/** Legacy cookie — no longer set, but cleared here for users with stale cookies. */
const LEGACY_SCHOOL_TOKEN_COOKIE = "sf_school_token";

async function resolveLogoutToken(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) return token;
  }

  const cookieStore = await cookies();
  return (
    cookieStore.get(ADMIN_TOKEN_COOKIE)?.value ??
    cookieStore.get(LEGACY_SCHOOL_TOKEN_COOKIE)?.value ??
    (await getBackendToken())
  );
}

export async function POST(request: NextRequest) {
  const token = await resolveLogoutToken(request);

  if (token) {
    try {
      await fetch(`${getAdminApiBase()}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
    } catch {
      // Best-effort blacklist; still clear local session below.
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ADMIN_TOKEN_COOKIE);
  response.cookies.delete(LEGACY_SCHOOL_TOKEN_COOKIE);
  return response;
}