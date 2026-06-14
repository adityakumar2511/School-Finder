"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Heart, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/parent", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/parent/favourites", label: "Favourites", icon: Heart, exact: false },
  { href: "/parent/inquiries", label: "My Inquiries", icon: MessageSquare, exact: false },
  { href: "/parent/profile", label: "Profile", icon: User, exact: false },
];

export default function ParentNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex gap-1 overflow-x-auto py-2 -mb-px">
          {links.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg font-heading font-semibold text-sm whitespace-nowrap transition-colors",
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-500 hover:text-blue-700 hover:bg-gray-50"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
