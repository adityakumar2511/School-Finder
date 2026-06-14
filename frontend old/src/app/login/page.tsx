import { Suspense } from "react";
import ParentLoginContent from "@/components/auth/ParentLoginContent";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ParentLoginContent />
    </Suspense>
  );
}
