import * as React from "react";
import { Card, CardContent } from "@/components/shared/ui/card";
import { cn } from "@/lib/utils";

export interface FormSectionProps {
  /**
   * Small uppercase label shown at the top of the card, e.g.
   * "IDENTITY", "CLASSIFICATION", "LOCATION". Matches the existing
   * `font-heading text-label font-semibold text-gray-700 uppercase
   * tracking-wide` style used across all 22 section files.
   */
  title: string;
  /** Optional action element rendered to the right of the title (e.g. an "Add field" button). */
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/**
 * FormSection — standard card wrapper for a group of related fields
 * within a profile-form section (e.g. "Identity", "Classification",
 * "Location", "Custom Fields").
 *
 * Replaces the repeated
 *   <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
 *     <CardContent className="p-6 space-y-5">
 *       <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">...</p>
 *       ...
 *     </CardContent>
 *   </Card>
 * block with a single component.
 */
export function FormSection({ title, action, className, children }: FormSectionProps) {
  return (
    <Card className={cn("border border-gray-100 shadow-card rounded-2xl bg-white", className)}>
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            {title}
          </p>
          {action}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}