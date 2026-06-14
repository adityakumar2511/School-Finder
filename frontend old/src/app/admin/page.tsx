import Link from "next/link";
import {
  School,
  Users,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  ArrowRight,
} from "lucide-react";
import { auth } from "@/lib/auth";
import {
  getAdminStats,
  getRecentSchoolRegistrations,
  getRecentInquiries,
  getRecentModerationActivity,
} from "@/lib/admin/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SchoolStatusBadge from "@/components/admin/SchoolStatusBadge";
import InquiryStatusBadge from "@/components/school/InquiryStatusBadge";

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminDashboardPage() {
  const session = await auth();

  const [stats, recentSchools, recentInquiries, moderation] = await Promise.all([
    getAdminStats(),
    getRecentSchoolRegistrations(5),
    getRecentInquiries(5),
    getRecentModerationActivity(5),
  ]);

  const statCards = [
    { label: "Total schools", value: stats.totalSchools, icon: School },
    { label: "Pending schools", value: stats.pendingSchools, icon: Clock },
    { label: "Approved schools", value: stats.approvedSchools, icon: CheckCircle2 },
    { label: "Rejected schools", value: stats.rejectedSchools, icon: XCircle },
    { label: "Total users", value: stats.totalUsers, icon: Users },
    { label: "Total inquiries", value: stats.totalInquiries, icon: ClipboardList },
  ];

  const quickActions = [
    { title: "Manage schools", href: "/admin/schools", description: "Review and moderate listings" },
    { title: "Manage users", href: "/admin/users", description: "Roles and account status" },
    { title: "View inquiries", href: "/admin/inquiries", description: "Global inquiry monitoring" },
    { title: "Add school", href: "/admin/add-school", description: "Create an approved listing" },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <p className="mb-6 font-body text-sm text-gray-500">
        Welcome back, {session?.user?.name ?? session?.user?.email}
      </p>

      <section className="mb-10">
        <h2 className="mb-4 font-heading font-bold text-lg text-blue-800">Overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-heading font-bold text-2xl text-blue-900">{value}</p>
                  <p className="font-body text-xs text-gray-500">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 font-heading font-bold text-lg text-blue-800">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <p className="font-heading font-semibold text-blue-800">{action.title}</p>
                  <p className="mt-1 font-body text-sm text-gray-500">{action.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-heading font-semibold text-blue-600">
                    Open <ArrowRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading font-bold text-lg text-blue-800">
              Latest school registrations
            </CardTitle>
            <Link href="/admin/schools" className="text-sm font-heading font-semibold text-blue-600">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentSchools.length === 0 ? (
              <p className="font-body text-sm text-gray-500">No schools registered yet.</p>
            ) : (
              recentSchools.map((school) => (
                <div
                  key={school.id}
                  className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-heading font-semibold text-blue-900">{school.name}</p>
                    <p className="font-body text-xs text-gray-500">
                      {school.city} · {school.owner.email}
                    </p>
                    <p className="font-body text-xs text-gray-400">{formatDate(school.createdAt)}</p>
                  </div>
                  <SchoolStatusBadge status={school.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading font-bold text-lg text-blue-800">
              Latest inquiries
            </CardTitle>
            <Link href="/admin/inquiries" className="text-sm font-heading font-semibold text-blue-600">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentInquiries.length === 0 ? (
              <p className="font-body text-sm text-gray-500">No inquiries yet.</p>
            ) : (
              recentInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-heading font-semibold text-sm text-blue-900">
                      {inquiry.school.name}
                    </p>
                    <InquiryStatusBadge status={inquiry.status} />
                  </div>
                  <p className="mt-1 line-clamp-2 font-body text-sm text-gray-600">
                    {inquiry.message}
                  </p>
                  <p className="mt-1 font-body text-xs text-gray-400">
                    {inquiry.parent.name ?? "Anonymous"} · {formatDate(inquiry.createdAt)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading font-bold text-lg text-blue-800">
              Recent approvals and rejections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {moderation.length === 0 ? (
              <p className="font-body text-sm text-gray-500">No moderation activity yet.</p>
            ) : (
              moderation.map((school) => (
                <div
                  key={school.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 last:border-0"
                >
                  <div>
                    <p className="font-heading font-semibold text-blue-900">{school.name}</p>
                    {school.rejectionReason && (
                      <p className="font-body text-xs text-danger-text">{school.rejectionReason}</p>
                    )}
                    <p className="font-body text-xs text-gray-400">
                      Updated {formatDate(school.updatedAt)}
                    </p>
                  </div>
                  <SchoolStatusBadge status={school.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-end">
        <Link
          href="/admin/add-school"
          className="btn-cta inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add school
        </Link>
      </div>
    </main>
  );
}
