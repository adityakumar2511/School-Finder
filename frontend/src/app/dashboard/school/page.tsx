  import Link from "next/link";
  import {
    MessageSquare,
    Mail,
    Phone,
    Edit,
    ArrowRight,
    AlertCircle,
  } from "lucide-react";
  import {
    getOwnedSchool,
    getInquiryStats,
    getRecentInquiries,
  } from "@/lib/school/data";
  import SchoolStatusCard from "@/components/school/SchoolStatusCard";
  import InquiryStatusBadge from "@/components/school/InquiryStatusBadge";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  export default async function SchoolDashboardPage() {
    const school = await getOwnedSchool();

    if (!school) {
      return (
        <main className="px-4 py-12">
          <div className="mx-auto max-w-2xl text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
            <h1 className="mt-4 font-heading font-bold text-2xl text-blue-800">
              No school profile found
            </h1>
            <p className="mt-2 font-body text-gray-500">
              Register your school to access the dashboard.
            </p>
            <Link
              href="/school-register"
              className="btn-primary mt-6 inline-flex items-center gap-2 text-sm"
            >
              Register school <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
      );
    }

    const [stats, recentInquiries] = await Promise.all([
      getInquiryStats(school.id),
      getRecentInquiries(school.id, 5),
    ]);

    const quickActions = [
      {
        title: "View inquiries",
        description: "Manage parent messages and update status",
        href: "/dashboard/school/inquiries",
      },
      {
        title: "Edit school profile",
        description: "Update listing details and contact information",
        href: "/dashboard/school/profile",
      },
      {
        title: "Update school information",
        description: "Fees, description, logo, and academics",
        href: "/dashboard/school/profile",
      },
    ];

    return (
      <main>
        <div className="bg-blue-800 px-4 py-8 text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {school.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={school.logoUrl}
                  alt={school.name}
                  className="h-14 w-14 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 font-heading font-bold text-xl text-white">
                  {school.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="font-heading font-bold text-2xl">{school.name}</h1>
                <p className="mt-0.5 font-body text-sm text-blue-200">
                  {school.city}, {school.state}
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/school/profile"
              className="btn-cta inline-flex items-center gap-2 text-sm"
            >
              <Edit className="h-4 w-4" />
              Edit profile
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
          {/* Profile completion banner */}
{(() => {
  const missing = [
    !school.address?.trim() && "Address",
    !school.city?.trim() && "City",
    !school.description?.trim() && "Description",
    !school.logoUrl && "Logo",
    !school.email && "School email",
    !school.website && "Website",
  ].filter(Boolean);

  if (missing.length === 0) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      <Link href="/dashboard/school/profile" className="block">
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl hover:bg-amber-100 transition-colors">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-heading font-semibold text-amber-800 text-sm">
              Complete your school profile
            </p>
            <p className="font-body text-xs text-amber-700 mt-0.5">
              Missing: {missing.join(", ")} — A complete profile gets more parent inquiries.
            </p>
          </div>
          <span className="ml-auto text-xs font-heading font-semibold text-amber-700 whitespace-nowrap">
            Fill now →
          </span>
        </div>
      </Link>
    </div>
  );
})()}
          <SchoolStatusCard
            status={school.status}
            rejectionReason={school.rejectionReason}
            publicSlug={school.status === "APPROVED" ? school.slug : undefined}
          />

          <section>
            <h2 className="mb-4 font-heading font-bold text-lg text-blue-800">
              Inquiry overview
            </h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: "Total inquiries", value: stats.total },
                { label: "New", value: stats.NEW },
                { label: "Contacted", value: stats.CONTACTED },
                { label: "Closed", value: stats.CLOSED },
              ].map(({ label, value }) => (
                <Card key={label}>
                  <CardContent className="p-5">
                    <p className="font-heading font-bold text-2xl text-blue-900">
                      {value}
                    </p>
                    <p className="mt-1 font-body text-xs text-gray-500">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-heading font-bold text-lg text-blue-800">
              Quick actions
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {quickActions.map((action) => (
                <Link key={action.title} href={action.href}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardContent className="p-5">
                      <p className="font-heading font-semibold text-blue-800">
                        {action.title}
                      </p>
                      <p className="mt-1 font-body text-sm text-gray-500">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading font-bold text-lg text-blue-800">
                Recent inquiries
              </CardTitle>
              <Link
                href="/dashboard/school/inquiries"
                className="inline-flex items-center gap-1 text-sm font-heading font-semibold text-blue-600 hover:text-blue-800"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentInquiries.length === 0 ? (
                <div className="py-10 text-center">
                  <MessageSquare className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-3 font-body text-sm text-gray-500">
                    No inquiries yet. They will appear here when parents contact
                    your school.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parent</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentInquiries.map((inquiry) => (
                      <TableRow key={inquiry.id}>
                        <TableCell className="font-heading font-semibold text-blue-900">
                          {inquiry.parent.name ?? "Anonymous"}
                        </TableCell>
                        <TableCell>{inquiry.parent.email}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {inquiry.message}
                        </TableCell>
                        <TableCell>
                          <InquiryStatusBadge status={inquiry.status} />
                        </TableCell>
                        <TableCell>{formatDate(inquiry.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading font-bold text-lg text-blue-800">
                Contact summary
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-blue-500" />
                <span className="font-body text-sm">{school.phone}</span>
              </div>
              {school.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span className="font-body text-sm">{school.email}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }
