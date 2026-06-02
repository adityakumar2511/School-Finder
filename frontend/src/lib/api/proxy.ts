import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { ADMIN_TOKEN_COOKIE, getAdminApiBase } from "@/lib/admin-auth";
import { mintBackendJwt } from "@/lib/backend-jwt";

async function resolveToken(useAdminCookie = false): Promise<string | null> {
  if (useAdminCookie) {
    const cookieStore = await cookies();
    return cookieStore.get(ADMIN_TOKEN_COOKIE)?.value ?? null;
  }

  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return null;
  }

  if (typeof session.backendAccessToken === "string" && session.backendAccessToken.length > 0) {
    return session.backendAccessToken;
  }

  return mintBackendJwt({
    id: session.user.id,
    role: session.user.role,
    email: session.user.email,
  });
}

export async function proxyToBackend(
  path: string,
  init: RequestInit = {},
  options: { useAdminCookie?: boolean } = {}
) {
  const token = await resolveToken(options.useAdminCookie);

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${getAdminApiBase()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}
