import { Suspense } from "react";
import SchoolLoginContent from "@/components/auth/SchoolLoginContent";

export default function SchoolLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SchoolLoginContent />
    </Suspense>
  );
}
