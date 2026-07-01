"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, School, Users } from "lucide-react";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const WordReveal = ({ text, className }: { text: string; className?: string }) => {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.25em]"
          variants={{
            hidden: { opacity: 0, y: 40, rotateX: -20 },
            visible: {
              opacity: 1,
              y: 0,
              rotateX: 0,
              transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1] as const,
                delay: i * 0.07,
              },
            },
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

export function AboutHero() {
  return (
    <section className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-hero-gradient">
      {/* Ambient background orbs — scaled per breakpoint for mobile perf & balance */}
      <motion.div
        className="absolute top-[-15%] left-[-10%] w-[240px] h-[240px] sm:w-[380px] sm:h-[380px] lg:w-[500px] lg:h-[500px] rounded-full bg-blue-400/10 blur-[80px] sm:blur-[100px] lg:blur-[120px] pointer-events-none"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[200px] h-[200px] sm:w-[320px] sm:h-[320px] lg:w-[400px] lg:h-[400px] rounded-full bg-amber-400/10 blur-[70px] sm:blur-[90px] lg:blur-[100px] pointer-events-none"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
      />

      {/* Subtle dot grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center py-20 sm:py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow badge */}
          <motion.div variants={fadeUp} className="mb-6 sm:mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-800/40 px-3.5 sm:px-4 py-1.5 font-body text-label text-blue-200 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              School Discovery Platform
            </span>
          </motion.div>

          {/* Main headline — word by word */}
          <motion.h1
            variants={fadeIn}
            className="font-heading text-h1 text-white mb-5 sm:mb-6 leading-tight"
            style={{ perspective: "800px" }}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <WordReveal text="The Right School." className="block" />
              <WordReveal
                text="The Right Student."
                className="block text-amber-400"
              />
              <WordReveal text="One Platform." className="block" />
            </motion.div>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeUp}
            className="font-body text-body-lg text-blue-200 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2 sm:px-0"
          >
            Every child deserves the right school. Every school deserves the
            opportunity to be discovered. Lakshya One brings both together —
            simple for parents, powerful for schools.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4"
          >
            <motion.div
              className="w-full sm:w-auto"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Link
                href="/schools"
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 font-heading text-btn font-semibold text-amber-800 shadow-amber hover:bg-amber-600 hover:text-white transition-colors"
              >
                <School className="w-4 h-4" />
                Find a School
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.div
              className="w-full sm:w-auto"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Link
                href="/school-register"
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-blue-400/40 bg-blue-800/30 px-6 py-3.5 font-heading text-btn font-semibold text-white backdrop-blur-sm hover:bg-blue-700/50 hover:border-blue-300/50 transition-colors"
              >
                <Users className="w-4 h-4" />
                List Your School
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            variants={scaleIn}
            className="mt-14 sm:mt-20 hidden sm:flex flex-col items-center gap-2"
          >
            <span className="font-body text-meta text-blue-300/60 tracking-widest uppercase">
              Scroll to explore
            </span>
            <motion.div
              className="w-px h-10 bg-gradient-to-b from-blue-300/40 to-transparent"
              animate={{ scaleY: [0.4, 1, 0.4], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}