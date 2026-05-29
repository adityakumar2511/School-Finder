import type { Role } from "@prisma/client";

/** Auth entry points — admin login is not linked in public UI */
export const AUTH_ROUTES = {
  parentLogin: "/login",
  parentRegister: "/register",
  schoolLogin: "/school-login",
  schoolRegister: "/school-register",
  adminLogin: "/admin-login",
} as const;

export type AuthContext = "parent" | "school" | "admin";

export const AUTH_CONTEXT_ROLE: Record<AuthContext, Role> = {
  parent: "PARENT",
  school: "SCHOOL_ADMIN",
  admin: "ADMIN",
};

export const ROLE_HOME: Record<Role, string> = {
  PARENT: "/",
  SCHOOL_ADMIN: "/dashboard/school",
  ADMIN: "/admin",
};

/** Post-logout redirect targets by role */
export const ROLE_LOGOUT_REDIRECT: Record<Role, string> = {
  PARENT: AUTH_ROUTES.parentLogin,
  SCHOOL_ADMIN: AUTH_ROUTES.schoolLogin,
  ADMIN: AUTH_ROUTES.adminLogin,
};

/** Routes restricted to guests (signed-out users only) */
export const GUEST_AUTH_ROUTES = [
  AUTH_ROUTES.parentLogin,
  AUTH_ROUTES.parentRegister,
  AUTH_ROUTES.schoolLogin,
  AUTH_ROUTES.schoolRegister,
  AUTH_ROUTES.adminLogin,
] as const;

/** Which roles may access each guest auth route */
export const ROUTE_ALLOWED_ROLE: Record<string, Role> = {
  [AUTH_ROUTES.parentLogin]: "PARENT",
  [AUTH_ROUTES.parentRegister]: "PARENT",
  [AUTH_ROUTES.schoolLogin]: "SCHOOL_ADMIN",
  [AUTH_ROUTES.schoolRegister]: "SCHOOL_ADMIN",
  [AUTH_ROUTES.adminLogin]: "ADMIN",
};

export const UNAUTHORIZED_ACCOUNT_MESSAGE = "Unauthorized account type";
