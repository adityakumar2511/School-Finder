"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { fadeInUp, easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";

type FadeInProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article";
};

function buildVariants(delay: number): Variants {
  return {
    hidden: fadeInUp.hidden,
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: easeOut, delay },
    },
  };
}

export default function FadeIn({
  children,
  className,
  delay = 0,
  as = "div",
}: FadeInProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const Component = motion[as];
  const variants = buildVariants(delay);

  return (
    <Component
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={variants}
    >
      {children}
    </Component>
  );
}
