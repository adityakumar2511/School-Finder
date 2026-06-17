"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  School,
  Users,
  MessageSquare,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminAccessLevel } from "@/lib/types/database";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/schools", label: "Schools", icon: School, exact: false },
  { href: "/admin/users", label: "Users", icon: Users, exact: false },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare, exact: false },
] as const;

export default function AdminNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const accessLevel = session?.user?.adminAccessLevel as AdminAccessLevel | null;

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex gap-1 overflow-x-auto">
          {links.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-heading font-semibold whitespace-nowrap",
                  active
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          {(accessLevel === "READ_WRITE" || accessLevel === "FULL_ACCESS") && (
            <>
              <Link
                href="/admin/add-school"
                className="btn-cta inline-flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                Add school
              </Link>
              <Link
                href="/admin/add-parent"
                className="btn-secondary inline-flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                Add parent
              </Link>
            </>
          )}
          {accessLevel === "FULL_ACCESS" && (
            <Link
              href="/admin/add-admin"
              className="btn-secondary inline-flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              Add admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}