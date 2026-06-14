"use client";

import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

type StaggerGridProps = {
  children: React.ReactNode;
  className?: string;
};

export default function StaggerGrid({ children, className }: StaggerGridProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-24px" }}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}
