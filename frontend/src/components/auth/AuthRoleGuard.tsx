"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";
import { ROLE_HOME } from "@/lib/auth-config";

type Props = {
  /** Role required to view this page (e.g. PARENT on /login) */
  allowedRole: Role;
  children: React.ReactNode;
};

/**
 * Redirects signed-in users with a different role away from auth pages.
 */
export default function AuthRoleGuard({ allowedRole, children }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.role) return;

    const userRole = session.user.role;
    if (userRole !== allowedRole) {
      router.replace(ROLE_HOME[userRole] ?? "/");
    }
  }, [status, session, allowedRole, router]);

  if (status === "loading") {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (
    status === "authenticated" &&
    session?.user?.role &&
    session.user.role !== allowedRole
  ) {
    return null;
  }

  return <>{children}</>;
}
