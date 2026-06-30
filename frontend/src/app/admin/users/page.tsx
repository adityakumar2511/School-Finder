import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { getAdminUsersList } from "@/lib/admin/data";
import { isAccountDisabled } from "@/lib/admin/constants";
import type { Role, AdminAccessLevel } from "@/lib/types/database";
import AdminSearchBar from "@/components/admin/search-pagination/AdminSearchBar";
import AdminPagination from "@/components/admin/search-pagination/AdminPagination";
import RoleBadge from "@/components/admin/users/RoleBadge";
import UserManagementActions from "@/components/admin/users/UserManagementActions";
import AdminAccessBadge from "@/components/admin/users/AdminAccessBadge";
import { Badge } from "@/components/shared/ui/badge";
import { Card, CardContent } from "@/components/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shared/ui/table";
import { Skeleton } from "@/components/shared/ui/skeleton";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

type SearchParams = Promise<{ q?: string; page?: string; role?: string }>;

const TABS: { label: string; role: Role }[] = [
  { label: "School Admins", role: "SCHOOL_ADMIN" },
  { label: "Parents", role: "PARENT" },
  { label: "Admins", role: "ADMIN" },
];

const VALID_ROLES: Role[] = ["SCHOOL_ADMIN", "PARENT", "ADMIN"];

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function buildTabHref(role: Role, q?: string) {
  const params = new URLSearchParams({ role });
  if (q?.trim()) params.set("q", q.trim());
  return `/admin/users?${params.toString()}`;
}

function UserTabs({
  activeRole,
  q,
  viewerAccessLevel,
}: {
  activeRole: Role;
  q?: string;
  viewerAccessLevel: AdminAccessLevel | null;
}) {
  const visibleTabs = TABS.filter(
    (tab) => tab.role !== "ADMIN" || viewerAccessLevel === "FULL_ACCESS",
  );

  return (
    <div className="mb-6 flex gap-1 border-b border-gray-200">
      {visibleTabs.map((tab) => {
        const isActive = tab.role === activeRole;
        return (
          <Link
            key={tab.role}
            href={buildTabHref(tab.role, q)}
            className={cn(
              "border-b-2 px-4 py-2 font-body text-sm font-medium transition-colors",
              isActive
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

async function UsersTable({
  searchParams,
  currentUserId,
  activeRole,
  viewerAccessLevel,
}: {
  searchParams: SearchParams;
  currentUserId: string;
  activeRole: Role;
  viewerAccessLevel: AdminAccessLevel | null;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const search = params.q?.trim();

  const result = await getAdminUsersList({
    page,
    limit: PAGE_SIZE,
    search,
    role: activeRole,
  });

  const isAdminTab = activeRole === "ADMIN";

  return (
    <>
      <p className="mb-4 font-body text-sm text-gray-500">
        {result.total} user{result.total === 1 ? "" : "s"} found
      </p>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                {isAdminTab && <TableHead>Access Level</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.users.map((user) => {
                const disabled = isAccountDisabled(user.phone);
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-heading font-semibold">
                      {user.name ?? "—"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    {isAdminTab && (
                      <TableCell>
                        <AdminAccessBadge
                          level={
                            (
                              user as {
                                adminAccessLevel?: AdminAccessLevel | null;
                              }
                            ).adminAccessLevel ?? null
                          }
                          isSuperAdmin={user.isSuperAdmin ?? false} // ← add karo
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge variant={disabled ? "danger" : "success"}>
                        {disabled ? "Disabled" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <UserManagementActions
                        userId={user.id}
                        currentRole={user.role}
                        accountStatus={disabled ? "disabled" : "active"}
                        isSelf={user.id === currentUserId}
                        isSuperAdmin={user.isSuperAdmin ?? false} // ← add karo
                        viewerAccessLevel={viewerAccessLevel}
                        activeRole={activeRole}
                        currentName={user.name}
                        currentEmail={user.email}
                        currentPhone={user.phone ?? null}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {result.users.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={isAdminTab ? 7 : 6}
                    className="text-center text-gray-400 py-8"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AdminPagination
        page={result.page}
        totalPages={result.totalPages}
        basePath="/admin/users"
        searchParams={{ q: search ?? undefined, role: activeRole }}
      />
    </>
  );
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const params = await searchParams;

  const viewerAccessLevel =
    (session?.user?.adminAccessLevel as AdminAccessLevel | null) ?? null;

  const activeRole: Role =
    params.role && VALID_ROLES.includes(params.role as Role)
      ? (params.role as Role)
      : "SCHOOL_ADMIN";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-blue-800">
          Users management
        </h1>
        <p className="mt-1 font-body text-sm text-gray-500">
          Manage roles and account access across the platform.
        </p>
      </div>

      <UserTabs
        activeRole={activeRole}
        q={params.q}
        viewerAccessLevel={viewerAccessLevel}
      />

      <Suspense fallback={<Skeleton className="mb-4 h-10 w-full max-w-sm" />}>
        <div className="mb-6">
          <AdminSearchBar
            basePath="/admin/users"
            currentQuery={params.q ?? ""}
            placeholder="Search by name or email"
          />
        </div>
      </Suspense>

      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <UsersTable
          searchParams={searchParams}
          currentUserId={session!.user!.id}
          activeRole={activeRole}
          viewerAccessLevel={viewerAccessLevel}
        />
      </Suspense>
    </main>
  );
}
