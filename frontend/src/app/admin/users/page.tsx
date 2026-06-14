import { Suspense } from "react";
import { auth } from "@/lib/auth/auth";
import { getAdminUsersList } from "@/lib/admin/data";
import { isAccountDisabled } from "@/lib/admin/constants";
import AdminSearchBar from "@/components/admin/search-pagination/AdminSearchBar";
import AdminPagination from "@/components/admin/search-pagination/AdminPagination";
import RoleBadge from "@/components/admin/users/RoleBadge";
import UserManagementActions from "@/components/admin/users/UserManagementActions";
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

const PAGE_SIZE = 10;

type SearchParams = Promise<{ q?: string; page?: string }>;

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function UsersTable({
  searchParams,
  currentUserId,
}: {
  searchParams: SearchParams;
  currentUserId: string;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const search = params.q?.trim();

  const result = await getAdminUsersList({ page, limit: PAGE_SIZE, search });

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
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AdminPagination
        page={result.page}
        totalPages={result.totalPages}
        basePath="/admin/users"
        searchParams={{ q: search ?? undefined }}
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

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-blue-800">Users management</h1>
        <p className="mt-1 font-body text-sm text-gray-500">
          Manage roles and account access across the platform.
        </p>
      </div>

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
        />
      </Suspense>
    </main>
  );
}
