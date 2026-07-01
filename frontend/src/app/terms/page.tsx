import type { Metadata } from "next";
import LegalPageLayout from "@/components/public/legal/LegalPageLayout";
import TermsContent from "@/components/public/legal/TermsContent";

export const metadata: Metadata = {
  title: "Terms of Service | Lakshya One",
  description:
    "Read the Terms of Service for Lakshya One, covering account registration, platform usage rules, school listing data, and liability.",
  alternates: {
    canonical: "https://lakshyaone.com/terms",
  },
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      lastUpdated="July 1, 2026"
      intro="Please read these terms carefully before using Lakshya One."
    >
      <TermsContent />
    </LegalPageLayout>
  );
}