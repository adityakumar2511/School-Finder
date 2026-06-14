import { NextResponse } from "next/server";
import type { Role } from "@/lib/types/database";
import { AUTH_ROUTES, ROLE_HOME } from "@/lib/auth-config";

export type MiddlewareToken = {
  id?: string;
  role?: Role;
};

const PARENT_AUTH_ROUTES = [AUTH_ROUTES.parentLogin, AUTH_ROUTES.parentRegister] as const;
const SCHOOL_AUTH_ROUTES = [AUTH_ROUTES.schoolLogin, AUTH_ROUTES.schoolRegister] as const;
const ADMIN_AUTH_ROUTES = [AUTH_ROUTES.adminLogin] as const;

export const isAdminArea = (pathname: string): boolean =>
  pathname === "/admin" || pathname.startsWith("/admin/");

/** Admin moderation panel routes (ADMIN only) */
export const ADMIN_PANEL_ROUTES = [
  "/admin",
  "/admin/schools",
  "/admin/users",
  "/admin/inquiries",
] as const;

/** School admin panel: dashboard, inquiries, profile */
export const SCHOOL_DASHBOARD_ROUTES = [
  "/dashboard/school",
  "/dashboard/school/inquiries",
  "/dashboard/school/profile",
] as const;

export const isSchoolDashboard = (pathname: string): boolean =>
  pathname === "/dashboard/school" || pathname.startsWith("/dashboard/school/");

export const isParentArea = (pathname: string): boolean =>
  pathname === "/parent" || pathname.startsWith("/parent/");

export const isProtectedDashboard = (pathname: string): boolean =>
  isAdminArea(pathname) || isSchoolDashboard(pathname) || isParentArea(pathname);

export const matchesRoute = (pathname: string, routes: readonly string[]): boolean =>
  routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

const safeRedirect = (requestUrl: string, pathname: string, target: string): NextResponse | null => {
  const destination = new URL(target, requestUrl);
  if (destination.pathname === pathname) {
    return null;
  }
  return NextResponse.redirect(destination);
};

const redirectToLoginWithCallback = (
  requestUrl: string,
  pathname: string,
  loginPath: string
): NextResponse | null => {
  const callback = encodeURIComponent(pathname);
  return safeRedirect(requestUrl, pathname, `${loginPath}?callbackUrl=${callback}`);
};

/**
 * Centralized role-based route protection.
 * Returns a redirect response, or null to continue the request.
 */
export function resolveMiddlewareRedirect(
  pathname: string,
  role: Role | undefined,
  requestUrl: string
): NextResponse | null {
  // --- Unauthenticated: protect dashboards ---
  if (!role) {
    if (isAdminArea(pathname)) {
      return redirectToLoginWithCallback(requestUrl, pathname, AUTH_ROUTES.adminLogin);
    }
    if (isSchoolDashboard(pathname)) {
      return redirectToLoginWithCallback(requestUrl, pathname, AUTH_ROUTES.schoolLogin);
    }
    if (isParentArea(pathname)) {
      return redirectToLoginWithCallback(requestUrl, pathname, AUTH_ROUTES.parentLogin);
    }
    return null;
  }

  // --- Parent area: PARENT only; other roles go to home ---
  if (isParentArea(pathname)) {
    if (!role) {
      return safeRedirect(requestUrl, pathname, AUTH_ROUTES.parentLogin);
    }
    if (role !== "PARENT") {
      return safeRedirect(requestUrl, pathname, ROLE_HOME.PARENT);
    }
    return null;
  }

  // --- ADMIN ---
  if (role === "ADMIN") {
    if (isSchoolDashboard(pathname)) {
      return safeRedirect(requestUrl, pathname, ROLE_HOME.ADMIN);
    }
    if (isAdminArea(pathname)) {
      return null;
    }
    if (
      matchesRoute(pathname, PARENT_AUTH_ROUTES) ||
      matchesRoute(pathname, SCHOOL_AUTH_ROUTES)
    ) {
      return safeRedirect(requestUrl, pathname, ROLE_HOME.ADMIN);
    }
    if (matchesRoute(pathname, ADMIN_AUTH_ROUTES)) {
      return safeRedirect(requestUrl, pathname, ROLE_HOME.ADMIN);
    }
    return null;
  }

  // --- SCHOOL_ADMIN ---
  if (role === "SCHOOL_ADMIN") {
    if (isAdminArea(pathname)) {
      return safeRedirect(requestUrl, pathname, ROLE_HOME.SCHOOL_ADMIN);
    }
    if (isSchoolDashboard(pathname)) {
      return null;
    }
    if (
      matchesRoute(pathname, PARENT_AUTH_ROUTES) ||
      matchesRoute(pathname, ADMIN_AUTH_ROUTES)
    ) {
      return safeRedirect(requestUrl, pathname, ROLE_HOME.SCHOOL_ADMIN);
    }
    return null;
  }

  // --- PARENT ---
  if (role === "PARENT") {
    if (isAdminArea(pathname) || isSchoolDashboard(pathname)) {
      return safeRedirect(requestUrl, pathname, ROLE_HOME.PARENT);
    }
    if (
      matchesRoute(pathname, SCHOOL_AUTH_ROUTES) ||
      matchesRoute(pathname, ADMIN_AUTH_ROUTES)
    ) {
      return safeRedirect(requestUrl, pathname, ROLE_HOME.PARENT);
    }
    return null;
  }

  return null;
}
