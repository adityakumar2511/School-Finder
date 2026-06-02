import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { ADMIN_TOKEN_COOKIE, getAdminApiBase } from "@/lib/admin-auth";
import { mintBackendJwt } from "@/lib/backend-jwt";

export function getApiBase(): string {
  return getAdminApiBase().replace(/\/$/, "");
}

export async function getBackendToken(): Promise<string | null> {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return null;
  }

  if (session.user.role === "ADMIN") {
    const cookieStore = await cookies();
    return cookieStore.get(ADMIN_TOKEN_COOKIE)?.value ?? null;
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

export async function backendFetch<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const token = await getBackendToken();
  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(`${getApiBase()}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as T | null;
    return { ok: response.ok, status: response.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

export async function getAdminToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_TOKEN_COOKIE)?.value ?? null;
}

export async function adminFetch<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const token = await getAdminToken();
  if (!token) {
    return { ok: false, status: 401, data: null };
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(`${getApiBase()}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as T | null;
    return { ok: response.ok, status: response.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}
