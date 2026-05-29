import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 font-body text-meta font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-blue-200 bg-blue-50 text-blue-800",
        secondary: "border-gray-100 bg-gray-50 text-gray-900",
        success: "border-success-text/20 bg-success-bg text-success-text",
        warning: "border-warning-text/20 bg-warning-bg text-warning-text",
        danger: "border-danger-text/20 bg-danger-bg text-danger-text",
        info: "border-info-text/20 bg-info-bg text-info-text",
        outline: "border-gray-100 text-gray-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
