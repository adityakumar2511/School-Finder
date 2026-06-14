"use client";

import { usePathname } from "next/navigation";

export default function HideOnAdminLogin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin-login") {
    return null;
  }
  return <>{children}</>;
}
