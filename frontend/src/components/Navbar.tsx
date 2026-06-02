"use client";

import { useState } from "react";
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
  UserPlus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/lib/auth-config";
import { performLogout } from "@/lib/logout";
import type { Role } from "@/lib/types/database";

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

  const roleLinks: Record<string, { href: string; label: string; icon: React.ReactNode }[]> = {
    PARENT: [
      {
        href: "/parent",
        label: "Dashboard",
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
      { href: "/parent/favourites", label: "Favourites", icon: <Heart className="w-4 h-4" /> },
    ],
    SCHOOL_ADMIN: [
      {
        href: "/dashboard/school",
        label: "Dashboard",
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
    ],
    ADMIN: [
      { href: "/admin", label: "Admin Panel", icon: <ShieldCheck className="w-4 h-4" /> },
    ],
  };

  const navLinks = isAuthenticated && role ? (roleLinks[role] ?? []) : [];
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
    <header className="sticky top-0 z-50 bg-blue-800 shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" onClick={close} className="flex items-center gap-2 group">
            <span className="p-1.5 rounded-lg bg-amber-400 transition-transform group-hover:scale-105">
              <GraduationCap className="w-5 h-5 text-white" />
            </span>
            <span className="font-heading font-bold text-xl text-white tracking-tight">
              SchoolFinder
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/schools"
              className="font-heading font-semibold text-sm text-blue-200 px-3 py-2 rounded-md hover:text-white hover:bg-white/10 transition-colors"
            >
              Browse Schools
            </Link>

            {isLoading && !isAuthenticated ? (
              <div className="ml-2 h-9 w-24 rounded-md bg-white/10 animate-pulse" aria-hidden="true" />
            ) : (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-1.5 font-heading font-semibold text-sm text-blue-200 px-3 py-2 rounded-md hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}

                {isAuthenticated ? (
                  <div className="flex items-center gap-2 ml-2">
                    {session?.user?.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={session.user.image}
                        alt={session.user.name ?? "User"}
                        className="w-8 h-8 rounded-full border-2 border-white/30"
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex items-center gap-1.5 font-heading font-semibold text-sm text-blue-200 hover:text-white hover:bg-white/10 disabled:opacity-60"
                    >
                      {loggingOut ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4" />
                      )}
                      {loggingOut ? "Signing out..." : "Log out"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 ml-2">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="font-heading font-semibold text-sm text-white border border-blue-200/40 hover:bg-white/10"
                    >
                      <Link href={AUTH_ROUTES.parentLogin} className="flex items-center gap-1.5">
                        <LogIn className="w-4 h-4" />
                        Parent Login
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="font-heading font-semibold text-sm text-white border border-blue-200/40 hover:bg-white/10"
                    >
                      <Link href={AUTH_ROUTES.parentRegister} className="flex items-center gap-1.5">
                        <UserPlus className="w-4 h-4" />
                        Parent Register
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="font-heading font-semibold text-sm text-blue-200 hover:text-white hover:bg-white/10"
                    >
                      <Link href={AUTH_ROUTES.schoolLogin} className="flex items-center gap-1.5">
                        <School className="w-4 h-4" />
                        School Login
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className="font-heading font-semibold text-sm bg-amber-400 text-amber-800 hover:bg-amber-600 hover:text-white shadow-amber transition-all"
                    >
                      <Link href={AUTH_ROUTES.schoolRegister} className="flex items-center gap-1.5">
                        <School className="w-4 h-4" />
                        Register School
                      </Link>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-md text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-3 pb-4 flex flex-col gap-1 border-t border-blue-200/20">
            <MobileLink href="/schools" onClick={close}>
              Browse Schools
            </MobileLink>

            {isLoading && !isAuthenticated ? (
              <div className="mx-3 mt-2 h-10 rounded-md bg-white/10 animate-pulse" aria-hidden="true" />
            ) : (
              <>
                {navLinks.map((link) => (
                  <MobileLink key={link.href} href={link.href} onClick={close} icon={link.icon}>
                    {link.label}
                  </MobileLink>
                ))}

                {isAuthenticated ? (
                  <>
                    {session?.user?.name && (
                      <p className="px-3 py-1 text-xs text-blue-200">{session.user.name}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-md font-heading font-semibold text-sm text-blue-200 hover:text-white hover:bg-white/10 transition-colors text-left disabled:opacity-60"
                    >
                      {loggingOut ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4" />
                      )}
                      {loggingOut ? "Signing out..." : "Log out"}
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 pt-2 px-3">
                    <Button
                      asChild
                      variant="ghost"
                      className="font-heading font-semibold text-white border border-blue-200/40 hover:bg-white/10 justify-start"
                    >
                      <Link href={AUTH_ROUTES.parentLogin} onClick={close} className="flex items-center gap-2">
                        <LogIn className="w-4 h-4" />
                        Parent Login
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      className="font-heading font-semibold text-white border border-blue-200/40 hover:bg-white/10 justify-start"
                    >
                      <Link href={AUTH_ROUTES.parentRegister} onClick={close} className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Parent Register
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      className="font-heading font-semibold text-blue-200 hover:text-white hover:bg-white/10 justify-start"
                    >
                      <Link href={AUTH_ROUTES.schoolLogin} onClick={close} className="flex items-center gap-2">
                        <School className="w-4 h-4" />
                        School Login
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="font-heading font-semibold bg-amber-400 text-amber-800 hover:bg-amber-600 hover:text-white justify-start"
                    >
                      <Link href={AUTH_ROUTES.schoolRegister} onClick={close} className="flex items-center gap-2">
                        <School className="w-4 h-4" />
                        Register School
                      </Link>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

function MobileLink({
  href,
  children,
  onClick,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2.5 rounded-md font-heading font-semibold text-sm text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
    >
      {icon}
      {children}
    </Link>
  );
}
