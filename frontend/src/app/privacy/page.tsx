import type { Metadata } from "next";
import LegalPageLayout from "@/components/public/legal/LegalPageLayout";
import PrivacyContent from "@/components/public/legal/PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy | Lakshya One",
  description:
    "Learn how Lakshya One collects, uses, and protects your personal information, including data shared with third-party services.",
  alternates: {
    canonical: "https://lakshyaone.com/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated="July 1, 2026"
      intro="How we collect, use, and protect your information on Lakshya One."
    >
      <PrivacyContent />
    </LegalPageLayout>
  );
}