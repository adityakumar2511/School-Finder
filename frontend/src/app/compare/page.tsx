import type { Metadata } from "next";
import Link from "next/link";
import { GitCompare, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Compare Schools | SchoolFinder",
  description: "Compare schools side by side — coming soon to SchoolFinder.",
};

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
        <GitCompare className="w-8 h-8 text-blue-600" />
      </div>
      <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
        Coming Soon
      </span>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Compare Schools</h1>
      <p className="text-gray-500 max-w-sm leading-relaxed mb-8">
        Select 2–3 schools and compare them side by side on fees, facilities, boards, and more.
        This feature is currently in the works.
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