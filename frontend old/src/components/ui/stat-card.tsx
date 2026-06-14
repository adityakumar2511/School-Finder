"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type StatCardProps = {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  trend?: string;
  className?: string;
  accent?: "default" | "primary" | "success" | "warning" | "muted";
};

const accentStyles = {
  default: "bg-white border-gray-100",
  primary: "bg-gradient-to-br from-blue-600 to-blue-800 text-white border-transparent",
  success: "bg-success-bg border-success-text/20",
  warning: "bg-warning-bg border-amber-100",
  muted: "bg-gray-50 border-gray-100",
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  className,
  accent = "default",
}: StatCardProps) {
  const reduceMotion = useReducedMotion();
  const isPrimary = accent === "primary";

  const inner = (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-card transition-shadow hover:shadow-card-hover h-full",
        accentStyles[accent],
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={cn(
              "font-body text-label",
              isPrimary ? "text-blue-100" : "text-gray-500"
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              "font-heading font-bold mt-1 tabular-nums",
              isPrimary ? "text-3xl text-white" : "text-2xl text-blue-900"
            )}
          >
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                "font-body text-meta mt-1",
                isPrimary ? "text-blue-200" : "text-gray-400"
              )}
            >
              {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              isPrimary ? "bg-white/15" : "bg-blue-50"
            )}
            aria-hidden
          >
            <Icon
              className={cn(
                "h-5 w-5",
                isPrimary ? "text-amber-300" : "text-blue-600"
              )}
            />
          </div>
        )}
      </div>
    </div>
  );

  if (reduceMotion) return inner;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {inner}
    </motion.div>
  );
}
