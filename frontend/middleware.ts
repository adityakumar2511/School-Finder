import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Role } from "@prisma/client";
import { authSecret } from "@/lib/auth";
import {
  isProtectedDashboard,
  resolveMiddlewareRedirect,
} from "@/lib/middleware-auth";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
} as const;

const withNoStore = (response: NextResponse): NextResponse => {
  for (const [key, value] of Object.entries(NO_STORE_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
};

/**
 * Centralized role-based route protection.
 * Reads JWT role via getToken — see src/lib/middleware-auth.ts for rules.
 *
 * School admin operational routes (SCHOOL_ADMIN only):
 * /dashboard/school, /dashboard/school/inquiries, /dashboard/school/profile
 *
 * Admin moderation panel (ADMIN only):
 * /admin, /admin/schools, /admin/users, /admin/inquiries
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: authSecret,
  });

  const role = token?.role as Role | undefined;

  const redirect = resolveMiddlewareRedirect(pathname, role, req.url);
  if (redirect) {
    return withNoStore(redirect);
  }

  if (isProtectedDashboard(pathname)) {
    return withNoStore(NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/dashboard/:path*",
    "/parent",
    "/parent/:path*",
    "/login",
    "/register",
    "/school-login",
    "/school-register",
    "/admin-login",
  ],
};
