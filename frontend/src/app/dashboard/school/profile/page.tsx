import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { getOwnedSchool } from "@/lib/school/data";
import { getSchoolGalleryImages } from "@/lib/school/gallery";
import SchoolProfileForm from "@/components/school/SchoolProfileForm";
import SchoolGalleryManager from "@/components/school/SchoolGalleryManager";
import SchoolStatusCard from "@/components/school/SchoolStatusCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SchoolProfilePage() {
  const session = await auth();
  const ownerId = session!.user!.id;

  const [school, galleryImages] = await Promise.all([
    getOwnedSchool(),
    getSchoolGalleryImages(ownerId),
  ]);

  if (!school) {
    return (
      <main className="px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-amber-500" />
          <p className="mt-3 font-body text-gray-500">No school profile found.</p>
          <Link
            href="/school-register"
            className="mt-4 inline-block text-sm font-heading font-semibold text-blue-600"
          >
            Register your school
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-blue-800">
          School profile
        </h1>
        <p className="mt-1 font-body text-sm text-gray-500">
          Update your listing, logo, gallery photos, contact details, and fees.
        </p>
      </div>

      <div className="mb-8">
        <SchoolStatusCard
          status={school.status}
          rejectionReason={school.rejectionReason}
        />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-heading font-bold text-lg text-blue-800">
            Photo gallery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SchoolGalleryManager initialImages={galleryImages} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading font-bold text-lg text-blue-800">
            Edit school information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SchoolProfileForm school={school} />
        </CardContent>
      </Card>
    </main>
  );
}
