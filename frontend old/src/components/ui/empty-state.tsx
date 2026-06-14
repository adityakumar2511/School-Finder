"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { scaleIn } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
  variant?: "default" | "compact";
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
  variant = "default",
}: EmptyStateProps) {
  const reduceMotion = useReducedMotion();
  const isCompact = variant === "compact";

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        isCompact ? "py-12 px-4" : "py-16 px-6",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-card mb-5",
          isCompact ? "w-14 h-14" : "w-20 h-20"
        )}
        aria-hidden
      >
        <Icon
          className={cn(
            "text-blue-500",
            isCompact ? "w-7 h-7" : "w-9 h-9"
          )}
        />
      </div>
      <h3
        className={cn(
          "font-heading font-semibold text-blue-800",
          isCompact ? "text-lg" : "text-h3"
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          "font-body text-gray-500 max-w-md mt-2 leading-relaxed",
          isCompact ? "text-sm" : "text-body"
        )}
      >
        {description}
      </p>
      {actionLabel && actionHref && (
        <Button asChild className="mt-6 rounded-xl shadow-btn" size={isCompact ? "sm" : "default"}>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
      {actionLabel && onAction && !actionHref && (
        <Button
          type="button"
          onClick={onAction}
          className="mt-6 rounded-xl shadow-btn"
          size={isCompact ? "sm" : "default"}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );

  if (reduceMotion) {
    return content;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={scaleIn}
      role="status"
    >
      {content}
    </motion.div>
  );
}
