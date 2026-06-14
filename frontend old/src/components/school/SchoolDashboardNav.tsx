"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard/school", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/school/inquiries", label: "Inquiries", icon: MessageSquare, exact: false },
  { href: "/dashboard/school/profile", label: "Profile", icon: Building2, exact: false },
] as const;

export default function SchoolDashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-heading font-semibold whitespace-nowrap transition-colors",
                active
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-blue-700"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
