import { cookies } from "next/headers";
import { getAdminApiBase } from "@/lib/admin-auth";
import { ADMIN_TOKEN_COOKIE } from "@/lib/admin-auth";
import { resolveBackendToken } from "@/lib/api/resolve-backend-token";

export function getApiBase(): string {
  return getAdminApiBase().replace(/\/$/, "");
}

export async function getBackendToken(): Promise<string | null> {
  return resolveBackendToken();
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
