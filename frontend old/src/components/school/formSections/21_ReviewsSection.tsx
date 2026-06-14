"use client";

import { Star, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { SectionProps } from "./types";

// ─────────────────────────────────────────────────────────────
// Component — Read Only
// ─────────────────────────────────────────────────────────────

export default function ReviewsSection(_props: SectionProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">Reviews</h2>
        <p className="font-body text-body text-gray-400 mt-1">
          Parent and student reviews — system generated, not editable
        </p>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4 flex items-start gap-3">
        <Star className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-heading text-label font-semibold text-amber-700">
            Reviews are auto-generated
          </p>
          <p className="font-body text-sm text-amber-600 mt-0.5">
            Reviews and ratings are submitted by parents and students on SchoolFinder. They cannot be edited by school admins to ensure authenticity.
          </p>
        </div>
      </div>

      {/* Empty state */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
          <MessageSquare className="w-10 h-10 text-gray-200" />
          <p className="font-heading text-label font-semibold text-gray-400">
            No reviews yet
          </p>
          <p className="font-body text-sm text-gray-400 max-w-sm">
            Once parents and students start reviewing your school on SchoolFinder, their reviews will appear here.
          </p>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-4">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            How Reviews Work
          </p>
          <div className="space-y-3">
            {[
              { step: "1", text: "Parents and students visit your school's public profile on SchoolFinder." },
              { step: "2", text: "They submit a star rating and written review after verification." },
              { step: "3", text: "Approved reviews appear on your profile and in this section." },
              { step: "4", text: "Your overall rating is calculated automatically from all reviews." },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-heading text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step}
                </span>
                <p className="font-body text-sm text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}