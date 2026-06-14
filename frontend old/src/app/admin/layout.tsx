import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin-login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 font-body">
      <div className="bg-blue-800 px-4 py-6 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm uppercase tracking-widest text-blue-200">Administration</p>
          <h1 className="font-heading font-bold text-2xl">SchoolFinder Admin</h1>
          <p className="mt-1 text-sm text-blue-200">
            Signed in as {session.user.name ?? session.user.email}
          </p>
        </div>
      </div>
      <AdminNav />
      {children}
    </div>
  );
}
