import type { Metadata } from "next";
import { AboutHero } from "@/components/public/about/AboutHero";
import { AboutStory } from "@/components/public/about/AboutStory";
import { AboutStats } from "@/components/public/about/AboutStats";
import { AboutForWhom } from "@/components/public/about/AboutForWhom";
import { AboutHowItWorks } from "@/components/public/about/AboutHowItWorks";
import { AboutValues } from "@/components/public/about/AboutValues";
import { AboutFAQ } from "@/components/public/about/AboutFAQ";
import { AboutClosingCTA } from "@/components/public/about/AboutClosingCTA";

export const metadata: Metadata = {
  title: "About Us | Lakshya One — School Discovery Platform",
  description:
    "Learn about Lakshya One's mission to help parents discover the right school across India. Simple for parents. Powerful for schools. Built for every town and city.",
  openGraph: {
    title: "About Us | Lakshya One",
    description:
      "Lakshya One connects parents with the right schools across India — starting with the cities that need it most.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <AboutHero />
      <AboutStory />
      <AboutStats />
      <AboutForWhom />
      <AboutHowItWorks />
      <AboutValues />
      <AboutFAQ />
      <AboutClosingCTA />
    </main>
  );
}