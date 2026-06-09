import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOwnedSchool } from "@/lib/school/data";
import Link from "next/link";
import { FileText, ArrowRight, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Complete Registration — SchoolFinder",
  robots: { index: false, follow: false },
};

export default async function SchoolCompleteRegistrationPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/school-login?callbackUrl=/school-complete-registration");
  }

  if (session.user.role !== "SCHOOL_ADMIN") {
    redirect("/");
  }

  const school = await getOwnedSchool();

  // If school doesn't exist, send to register
  if (!school) {
    redirect("/school-register");
  }

  // If school is no longer DRAFT, send to dashboard
  if (school.status !== "DRAFT") {
    redirect("/dashboard/school");
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
          <CardContent className="px-8 py-10">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 mx-auto mb-6">
              <FileText className="w-7 h-7 text-amber-600" />
            </div>

            <h1 className="font-heading font-bold text-2xl text-blue-800 text-center mb-2">
              Complete your registration
            </h1>
            <p className="font-body text-sm text-gray-500 text-center mb-8">
              Your school profile is saved as a draft. Complete the registration
              to submit it for admin review and go live on SchoolFinder.
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200/60">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                <p className="font-body text-sm text-amber-800">
                  Your draft is saved — your progress won&apos;t be lost
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200/60">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                <p className="font-body text-sm text-blue-800">
                  After submission, our team will review and approve your listing
                </p>
              </div>
            </div>

            <Button
              asChild
              className="w-full h-11 bg-amber-400 hover:bg-amber-500 text-amber-900 font-heading font-semibold rounded-xl shadow-sm"
            >
              <Link href="/school-register" className="inline-flex items-center gap-2">
                Continue registration
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>

            <div className="mt-4 text-center">
              <Link
                href="/api/auth/signout"
                className="inline-flex items-center gap-1.5 font-body text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}