import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import ParentNav from "@/components/parent/ParentNav";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/parent");
  }

  if (session.user.role !== "PARENT") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 font-body">
      <ParentNav />
      {children}
    </div>
  );
}
