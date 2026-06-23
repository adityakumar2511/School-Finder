import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "AI School Recommendation | SchoolFinder",
  description:
    "AI-powered school recommendations are coming soon to SchoolFinder.",
};

export default function AiRecommendPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-6">
        <Sparkles className="w-8 h-8 text-purple-600" />
      </div>

      <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
        Coming Soon
      </span>

      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        AI School Recommendation
      </h1>

      <p className="text-gray-500 max-w-md leading-relaxed mb-8">
        Soon, parents will be able to get smart school suggestions based on
        location, budget, board, facilities, and preferences. This feature is
        currently in the works.
      </p>

      <Link
        href="/schools"
        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Browse Schools
      </Link>
    </div>
  );
}