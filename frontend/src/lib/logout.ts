"use client";

import { signOut } from "next-auth/react";
import type { Role } from "@/lib/types/database";
import { AUTH_ROUTES, ROLE_LOGOUT_REDIRECT } from "@/lib/auth-config";
import { clearParentBackendToken } from "@/lib/parent-token";

/**
 * Clears role-specific session state and performs a hard redirect
 * so middleware re-evaluates and protected pages cannot be restored via back navigation.
 */
export async function performLogout(role?: Role): Promise<void> {
  const redirectTo = role ? ROLE_LOGOUT_REDIRECT[role] : AUTH_ROUTES.parentLogin;

  if (role === "ADMIN") {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => undefined);
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
