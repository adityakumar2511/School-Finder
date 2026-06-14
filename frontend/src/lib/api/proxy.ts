import { NextResponse } from "next/server";
import { getAdminApiBase } from "@/lib/auth/admin-auth";
import { resolveBackendToken } from "@/lib/api/resolve-backend-token";

export async function proxyToBackend(
  path: string,
  init: RequestInit = {},
  options: { useAdminCookie?: boolean } = {}
) {
  const token = await resolveBackendToken({
    adminCookieOnly: options.useAdminCookie,
  });

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
