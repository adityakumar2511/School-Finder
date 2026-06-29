"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Search,
  LayoutList,
  GitCompare,
  MessageSquare,
  Clock,
  Users,
} from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/ui/motion";

const REASONS = [
  {
    icon: Search,
    title: "Simple school search",
    description:
      "Find schools by name, city, board, or locality — all in one search bar.",
  },
  {
    icon: LayoutList,
    title: "Organized school information",
    description:
      "Academics, facilities, fees, photos, and contact details — structured and easy to navigate.",
  },
  {
    icon: GitCompare,
    title: "Compare schools easily",
    description:
      "Place multiple schools side by side and compare what matters most to your family.",
  },
  {
    icon: MessageSquare,
    title: "Direct school inquiries",
    description:
      "Send inquiries to schools directly from their profile — no middlemen, no extra steps.",
  },
  {
    icon: Clock,
    title: "Save time during admissions",
    description:
      "Shortlist schools online before visiting campuses, saving you days of effort.",
  },
  {
    icon: Users,
    title: "Built for parents and schools",
    description:
      "Designed equally for families searching and institutions building their digital presence.",
  },
];

function WhyContent() {
  return (
    <section
      className="bg-white border-y border-gray-100"
      aria-labelledby="why-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: text */}
          <div>
            <span className="inline-block bg-amber-50 text-amber-800 text-xs font-heading font-semibold px-3 py-1.5 rounded-full mb-4 border border-amber-200">
              Why Lakshya One
            </span>
            <h2
              id="why-heading"
              className="font-heading font-bold text-h2 text-gray-900 tracking-tight"
            >
              Making school discovery simple for every family
            </h2>
            <p className="mt-4 font-body text-gray-500 leading-relaxed">
              Finding the right school often means visiting multiple campuses,
              collecting brochures, making phone calls, and comparing information
              from different places.
            </p>
            <p className="mt-3 font-body text-gray-500 leading-relaxed">
              Lakshya One simplifies this process by bringing school information
              together into one organized platform. Because choosing a school
              should be based on better information — not guesswork.
            </p>
          </div>

          {/* Right: reasons grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {REASONS.map((reason) => (
              <div
                key={reason.title}
                className="flex items-start gap-3 rounded-xl bg-gray-50 border border-gray-100 p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <reason.icon
                    className="w-4.5 h-4.5 text-blue-600"
                    aria-hidden
                    size={18}
                  />
                </div>
                <div>
                  <p className="font-heading font-semibold text-sm text-gray-900">
                    {reason.title}
                  </p>
                  <p className="mt-0.5 font-body text-xs text-gray-500 leading-relaxed">
                    {reason.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomeWhySection() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <WhyContent />;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer}
    >
      <motion.div variants={fadeInUp}>
        <WhyContent />
      </motion.div>
    </motion.div>
  );
}