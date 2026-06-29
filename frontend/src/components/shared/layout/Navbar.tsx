"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Menu,
  X,
  GraduationCap,
  Heart,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  LogIn,
  School,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { AUTH_ROUTES } from "@/lib/auth/auth-config";
import { performLogout } from "@/lib/auth/logout";
import type { Role } from "@/lib/types/database";

const PUBLIC_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/schools", label: "Schools" },
  { href: "/compare", label: "Compare" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const ROLE_LINKS: Record<
  string,
  { href: string; label: string; icon: ReactNode }[]
> = {
  PARENT: [
    {
      href: "/parent",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" aria-hidden />,
    },
    {
      href: "/parent/favourites",
      label: "Favourites",
      icon: <Heart className="h-4 w-4" aria-hidden />,
    },
  ],
  SCHOOL_ADMIN: [
    {
      href: "/dashboard/school",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" aria-hidden />,
    },
  ],
  ADMIN: [
    {
      href: "/admin",
      label: "Admin Panel",
      icon: <ShieldCheck className="h-4 w-4" aria-hidden />,
    },
  ],
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (pathname === AUTH_ROUTES.adminLogin) {
    return null;
  }

  const role = session?.user?.role;
  const isAuthenticated = status === "authenticated" && Boolean(session?.user);
  const isLoading = status === "loading" || loggingOut;
  const navLinks = isAuthenticated && role ? ROLE_LINKS[role] ?? [] : [];

  const close = () => setMobileOpen(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    close();

    try {
      await performLogout(role as Role | undefined);
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-blue-800 bg-blue-900 shadow-md">
      <nav
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            onClick={close}
            className="group flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <span className="rounded-xl bg-amber-400 p-2 shadow-amber transition-transform group-hover:scale-105">
              <GraduationCap className="h-5 w-5 text-white" aria-hidden />
            </span>

            <span className="font-heading text-xl font-bold tracking-tight text-white">
              Lakshya One
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {PUBLIC_NAV_LINKS.map((link) => {
              const active = isActivePath(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-xl px-3 py-2 font-heading text-sm font-semibold transition-colors ${
                    active
                      ? "bg-white/15 text-white"
                      : "text-blue-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <span className="mx-1 h-5 w-px bg-blue-200/30" aria-hidden />

            {isLoading && !isAuthenticated ? (
              <div
                className="ml-2 h-9 w-28 animate-pulse rounded-xl bg-white/10"
                aria-hidden
              />
            ) : (
              <>
                {navLinks.map((link) => {
                  const active = isActivePath(pathname, link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 font-heading text-sm font-semibold transition-colors ${
                        active
                          ? "bg-white/15 text-white"
                          : "text-blue-200 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  );
                })}

                {isAuthenticated ? (
                  <div className="ml-1 flex items-center gap-2">
                    {session?.user?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={session.user.image}
                        alt={session.user.name ?? "User"}
                        className="h-8 w-8 rounded-full border-2 border-white/30"
                      />
                    ) : null}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex items-center gap-1.5 rounded-xl border border-blue-200/30 px-3 font-heading text-sm font-semibold text-blue-200 hover:bg-white/10 hover:text-white disabled:opacity-60"
                    >
                      {loggingOut ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      ) : (
                        <LogOut className="h-4 w-4" aria-hidden />
                      )}
                      {loggingOut ? "Signing out..." : "Log out"}
                    </Button>
                  </div>
                ) : (
                  <div className="ml-1 flex items-center gap-2">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="rounded-xl border border-blue-200/40 px-4 font-heading text-sm font-semibold text-white hover:bg-white/10"
                    >
                      <Link
                        href={AUTH_ROUTES.parentLogin}
                        className="flex items-center gap-1.5"
                      >
                        <LogIn className="h-4 w-4" aria-hidden />
                        Parent Login
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="rounded-xl px-3 font-heading text-sm font-semibold text-blue-200 hover:bg-white/10 hover:text-white"
                    >
                      <Link
                        href={AUTH_ROUTES.schoolLogin}
                        className="flex items-center gap-1.5"
                      >
                        <School className="h-4 w-4" aria-hidden />
                        School Login
                      </Link>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <button
            type="button"
            className="rounded-xl p-2 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>

        {mobileOpen ? (
          <div className="flex flex-col gap-1 border-t border-blue-200/20 py-3 pb-4 md:hidden">
            {PUBLIC_NAV_LINKS.map((link) => (
              <MobileLink
                key={link.href}
                href={link.href}
                pathname={pathname}
                onClick={close}
              >
                {link.label}
              </MobileLink>
            ))}

            <div className="mx-3 my-1 h-px bg-blue-200/20" aria-hidden />

            {isLoading && !isAuthenticated ? (
              <div
                className="mx-3 mt-2 h-10 animate-pulse rounded-xl bg-white/10"
                aria-hidden
              />
            ) : (
              <>
                {navLinks.map((link) => (
                  <MobileLink
                    key={link.href}
                    href={link.href}
                    pathname={pathname}
                    onClick={close}
                    icon={link.icon}
                  >
                    {link.label}
                  </MobileLink>
                ))}

                {isAuthenticated ? (
                  <>
                    {session?.user?.name ? (
                      <p className="px-3 py-1 font-body text-xs text-blue-200">
                        {session.user.name}
                      </p>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left font-heading text-sm font-semibold text-blue-200 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-60"
                    >
                      {loggingOut ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      ) : (
                        <LogOut className="h-4 w-4" aria-hidden />
                      )}
                      {loggingOut ? "Signing out..." : "Log out"}
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 px-3 pt-2">
                    <Button
                      asChild
                      variant="ghost"
                      className="justify-start rounded-xl border border-blue-200/40 font-heading font-semibold text-white hover:bg-white/10"
                    >
                      <Link
                        href={AUTH_ROUTES.parentLogin}
                        onClick={close}
                        className="flex items-center gap-2"
                      >
                        <LogIn className="h-4 w-4" aria-hidden />
                        Parent Login
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="ghost"
                      className="justify-start rounded-xl font-heading font-semibold text-blue-200 hover:bg-white/10 hover:text-white"
                    >
                      <Link
                        href={AUTH_ROUTES.schoolLogin}
                        onClick={close}
                        className="flex items-center gap-2"
                      >
                        <School className="h-4 w-4" aria-hidden />
                        School Login
                      </Link>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : null}
      </nav>
    </header>
  );
}

function MobileLink({
  href,
  children,
  onClick,
  icon,
  pathname,
}: {
  href: string;
  children: ReactNode;
  onClick: () => void;
  icon?: ReactNode;
  pathname: string;
}) {
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 font-heading text-sm font-semibold transition-colors ${
        active
          ? "bg-white/15 text-white"
          : "text-blue-200 hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}