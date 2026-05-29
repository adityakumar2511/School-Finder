import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SchoolDashboardNav from "@/components/school/SchoolDashboardNav";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function SchoolDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/school-login?callbackUrl=/dashboard/school");
  }

  if (session.user.role !== "SCHOOL_ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 font-body">
      <SchoolDashboardNav />
      {children}
    </div>
  );
}
