"use client";

import AuthRoleGuard from "@/components/auth/AuthRoleGuard";
import SchoolRegisterWizard from "@/components/school/SchoolRegisterWizard";

export default function SchoolRegisterPage() {
  return (
    <AuthRoleGuard allowedRole="SCHOOL_ADMIN">
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 pt-8">
          <p className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 font-body text-sm text-blue-900">
            Images are validated and optimized automatically. Only JPEG, PNG, and
            WebP files up to 5MB are accepted for logos and gallery photos.
          </p>
        </div>
        <SchoolRegisterWizard />
      </div>
    </AuthRoleGuard>
  );
}
