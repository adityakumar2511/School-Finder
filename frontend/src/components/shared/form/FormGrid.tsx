import * as React from "react";
import { cn } from "@/lib/utils";

export interface FormGridProps {
  /**
   * Number of columns on medium+ screens. Always 1 column on mobile.
   * Matches the `sm:grid-cols-{n}` pattern already used across
   * the 22-section forms (e.g. Identity/Classification use 2,
   * Classes/Languages checkboxes use 4, School Timings uses 3).
   */
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  children: React.ReactNode;
}

const COLUMN_CLASSES: Record<NonNullable<FormGridProps["columns"]>, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};

/**
 * FormGrid — standard responsive grid for groups of form fields.
 *
 * Replaces the repeated `grid grid-cols-1 sm:grid-cols-2 gap-5` /
 * `grid grid-cols-2 sm:grid-cols-4 gap-2` patterns with a single
 * reusable wrapper so spacing stays consistent across all 22
 * section files.
 */
export function FormGrid({ columns = 2, className, children }: FormGridProps) {
  return (
    <div className={cn("grid gap-5", COLUMN_CLASSES[columns], className)}>
      {children}
    </div>
  );
}