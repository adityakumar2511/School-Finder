"use client";

import { signOut } from "next-auth/react";
import type { Role } from "@/lib/types/database";
import { AUTH_ROUTES, ROLE_LOGOUT_REDIRECT } from "@/lib/auth-config";
import { clearParentBackendToken, getParentBackendToken } from "@/lib/parent-token";

/**
 * Clears role-specific session state and performs a hard redirect
 * so middleware re-evaluates and protected pages cannot be restored via back navigation.
 */
export async function performLogout(role?: Role): Promise<void> {
  const redirectTo = role ? ROLE_LOGOUT_REDIRECT[role] : AUTH_ROUTES.parentLogin;

  const parentToken = role === "PARENT" ? getParentBackendToken() : null;
  await fetch("/api/auth/logout", {
    method: "POST",
    headers: parentToken ? { Authorization: `Bearer ${parentToken}` } : undefined,
  }).catch(() => undefined);

  if (role === "ADMIN") {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => undefined);
  }

  if (role === "SCHOOL_ADMIN") {
    await fetch("/api/school/session", { method: "DELETE" }).catch(() => undefined);
  }

  await signOut({ redirect: false });

  if (typeof window !== "undefined") {
    clearParentBackendToken();
    window.location.replace(redirectTo);
  }
}

export function getLogoutRedirect(role?: Role): string {
  return role ? ROLE_LOGOUT_REDIRECT[role] : AUTH_ROUTES.parentLogin;
}
