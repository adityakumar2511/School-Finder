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
import InquiryStatusBadge from "@/components/school/inquiries/InquiryStatusBadge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shared/ui/table";

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
        {/* Profile completion tracker */}
        {(() => {
          const sections = [
            {
              label: "Basic Info",
              done: !!(
                school.address?.trim() &&
                school.city?.trim() &&
                school.phone?.trim()
              ),
              tip: "Add your school address and phone number.",
            },
            {
              label: "About & Description",
              done: !!school.description?.trim(),
              tip: "Write a short description about your school.",
            },
            {
              label: "Logo & Branding",
              done: !!school.logoUrl,
              tip: "Upload your school logo for better visibility.",
            },
            {
              label: "Contact Details",
              done: !!(school.email && school.website),
              tip: "Add your school email and website.",
            },
            {
              label: "Fee Structure",
              done: !!(
                school.tuitionFeeMonthly ||
                school.admissionFee ||
                school.totalAnnualFee
              ),
              tip: "Add at least one fee detail so parents can plan ahead.",
            },
            {
              label: "Gallery / Images",
              done: !!(school.images && school.images.length > 0),
              tip: "Upload photos of your campus, classrooms, or events.",
            },
          ];

          const completedCount = sections.filter((s) => s.done).length;
          const totalCount = sections.length;
          const percent = Math.round((completedCount / totalCount) * 100);
          const allDone = completedCount === totalCount;
          const nextIncomplete = sections.find((s) => !s.done);

          if (allDone) return null;

          return (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              {/* Header row */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="font-heading font-bold text-amber-800 text-sm">
                    Complete your school profile
                  </p>
                </div>
                <span className="font-heading font-bold text-amber-700 text-sm whitespace-nowrap">
                  {completedCount}/{totalCount} done
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-amber-200 rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Section checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {sections.map((section) => (
                  <div
                    key={section.label}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-body ${
                      section.done
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-white border-amber-200 text-amber-700"
                    }`}
                  >
                    {section.done ? (
                      <svg
                        className="w-3.5 h-3.5 shrink-0 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span className="w-3.5 h-3.5 shrink-0 rounded-full border-2 border-amber-400 inline-block" />
                    )}
                    {section.label}
                  </div>
                ))}
              </div>

              {/* Next step hint + CTA */}
              {nextIncomplete && (
                <div className="flex items-center justify-between gap-4 pt-3 border-t border-amber-200">
                  <p className="font-body text-xs text-amber-700">
                    <span className="font-semibold">Next:</span>{" "}
                    {nextIncomplete.tip}
                  </p>
                  <Link
                    href="/dashboard/school/profile"
                    className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-heading font-semibold transition-colors"
                  >
                    Fill now <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
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
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
            {[
              { label: "Total inquiries", value: stats.total },
              { label: "New", value: stats.NEW },
              { label: "Contacted", value: stats.CONTACTED },
              { label: "Interested", value: stats.INTERESTED },
              { label: "Converted", value: stats.CONVERTED },
              { label: "Closed", value: stats.CLOSED },
            ].map(({ label, value }) => (
              <Card key={label}>
                <CardContent className="p-5">
                  <p className="font-heading font-bold text-2xl text-blue-900">
                    {value}
                  </p>
                  <p className="mt-1 font-body text-xs text-gray-500">
                    {label}
                  </p>
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
