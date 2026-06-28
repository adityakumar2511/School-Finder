// import { notFound } from "next/navigation";
// import Link from "next/link";
// import { ChevronLeft } from "lucide-react";
// import { getAdminSchoolById } from "@/lib/admin/data";
// import SchoolProfileForm from "@/components/school/profile/SchoolProfileForm";

// interface Props {
//   params: Promise<{ id: string }>;
// }

// export default async function AdminSchoolEditPage({ params }: Props) {
//   const { id } = await params;

//   const school = await getAdminSchoolById(id);

//   if (!school) {
//     notFound();
//   }

//   return (
//     <div className="max-w-6xl mx-auto px-4 py-8">
//       {/* Back link */}
//       <div className="mb-6">
//         <Link
//           href="/admin/schools"
//           className="inline-flex items-center gap-1.5 font-body text-sm text-gray-500 hover:text-gray-800 transition-colors"
//         >
//           <ChevronLeft className="w-4 h-4" />
//           Back to schools
//         </Link>
//       </div>

//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="font-heading text-2xl font-bold text-blue-900">
//           Edit School
//         </h1>
//         <p className="font-body text-sm text-gray-500 mt-1">
//           {school.name as string}{" "}
//           <span className="text-gray-400">·</span>{" "}
//           <span className="text-gray-400">{school.city as string}, {school.state as string}</span>
//         </p>
//       </div>

//       {/* Reuse SchoolProfileForm in admin mode:
//           - submitEndpoint → /api/admin/schools/[id]  (proxies PATCH /api/schools/:id via admin cookie)
//           - disableDraft   → true  (no localStorage collision with school-admin's own draft)
//       */}
//       <SchoolProfileForm
//         school={school as Record<string, unknown>}
//         submitEndpoint={`/api/admin/schools/${id}`}
//         disableDraft={true}
//       />
//     </div>
//   );
// }













// frontend/src/app/dashboard/school/profile/page.tsx

import { notFound } from "next/navigation";
import { getOwnedSchool } from "@/lib/school/data";
import SchoolProfileForm from "@/components/school/profile/SchoolProfileForm";

export default async function SchoolProfilePage() {
  const school = await getOwnedSchool();

  if (!school) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-blue-900">
          School Profile
        </h1>
        <p className="font-body text-sm text-gray-500 mt-1">
          Update your school information visible to parents and students.
        </p>
      </div>

      <SchoolProfileForm school={school as Record<string, unknown>} />
    </div>
  );
}