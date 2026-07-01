import type { Metadata } from "next";
import LegalPageLayout from "@/components/public/legal/LegalPageLayout";
import DisclaimerContent from "@/components/public/legal/DisclaimerContent";

export const metadata: Metadata = {
  title: "Data Disclaimer | Lakshya One",
  description:
    "Learn where Lakshya One's school listing data comes from, including school websites, third-party sources, and publicly available information, and how to report or correct it.",
  alternates: {
    canonical: "https://lakshyaone.com/disclaimer",
  },
};

export default function DisclaimerPage() {
  return (
    <LegalPageLayout
      title="Data Disclaimer"
      lastUpdated="July 1, 2026"
      intro="Transparency about where our school data comes from, and what it does and doesn't represent."
    >
      <DisclaimerContent />
    </LegalPageLayout>
  );
}