"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/lib/motion";

const TAGS = ["CBSE", "ICSE", "UP Board", "Boys", "Girls", "Co-Ed"];

function HeroInner() {
  return (
    <section className="relative overflow-hidden bg-hero-gradient text-white">
      <div
        className="absolute inset-0 bg-subtle-pattern opacity-60 pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none"
        aria-hidden
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 flex flex-col items-center text-center gap-8">
        <span className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-200 text-xs font-heading font-semibold px-3 py-1.5 rounded-full border border-amber-400/30">
          <Sparkles className="w-3.5 h-3.5" aria-hidden />
          India&apos;s trusted school discovery platform
        </span>

        <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-display-md leading-tight tracking-tight max-w-3xl">
          Find the <span className="text-amber-400">best schools</span> near you
        </h1>

        <p className="font-body text-blue-100 text-lg leading-relaxed max-w-2xl">
          Browse CBSE, ICSE, and state board schools in one place. Compare
          listings, explore fees, and contact schools directly.
        </p>

        <form
          action="/schools"
          method="GET"
          className="w-full max-w-2xl flex flex-col sm:flex-row gap-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/95 backdrop-blur-sm"
          role="search"
          aria-label="Search schools"
        >
          <div className="flex-1 flex items-center gap-3 px-4 py-3 sm:py-0">
            <Search className="w-5 h-5 text-gray-400 shrink-0" aria-hidden />
            <label htmlFor="home-search" className="sr-only">
              Search by school name or city
            </label>
            <input
              id="home-search"
              type="search"
              name="search"
              placeholder="School name or city…"
              className="w-full py-3 sm:py-4 text-gray-900 font-body text-sm outline-none placeholder:text-gray-400 bg-transparent focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="bg-amber-400 hover:bg-amber-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 transition-colors px-8 py-4 font-heading font-semibold text-btn text-amber-800 shrink-0"
          >
            Search schools
          </button>
        </form>

        <div className="flex flex-wrap gap-2 justify-center">
          {TAGS.map((tag) => (
            <Link
              key={tag}
              href={`/schools?board=${tag.replace(" ", "_").toUpperCase()}`}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-heading font-semibold px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              {tag}
            </Link>
          ))}
        </div>

        <p className="text-blue-200 text-sm font-body">
          School owner?{" "}
          <Link
            href="/school-register"
            className="text-amber-300 font-heading font-semibold hover:text-amber-200 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
          >
            List your school for free
          </Link>
        </p>
      </div>
    </section>
  );
}

function AnimatedHero() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.section
        variants={fadeInUp}
        className="relative overflow-hidden bg-hero-gradient text-white"
      >
        <div
          className="absolute inset-0 bg-subtle-pattern opacity-60 pointer-events-none"
          aria-hidden
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 flex flex-col items-center text-center gap-8">
          <motion.span
            variants={fadeInUp}
            className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-200 text-xs font-heading font-semibold px-3 py-1.5 rounded-full border border-amber-400/30"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden />
            India&apos;s trusted school discovery platform
          </motion.span>

          <motion.h1
            variants={fadeInUp}
            className="font-heading font-bold text-4xl sm:text-5xl lg:text-display-md leading-tight tracking-tight max-w-3xl"
          >
            Find the <span className="text-amber-400">best schools</span> near you
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="font-body text-blue-100 text-lg leading-relaxed max-w-2xl"
          >
            Browse CBSE, ICSE, and state board schools in one place. Compare
            listings, explore fees, and contact schools directly.
          </motion.p>

          <motion.form
            variants={fadeInUp}
            action="/schools"
            method="GET"
            className="w-full max-w-2xl flex flex-col sm:flex-row gap-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/95 backdrop-blur-sm"
            role="search"
            aria-label="Search schools"
          >
            <div className="flex-1 flex items-center gap-3 px-4 py-3 sm:py-0">
              <Search className="w-5 h-5 text-gray-400 shrink-0" aria-hidden />
              <label htmlFor="home-search" className="sr-only">
                Search by school name or city
              </label>
              <input
                id="home-search"
                type="search"
                name="search"
                placeholder="School name or city…"
                className="w-full py-3 sm:py-4 text-gray-900 font-body text-sm outline-none placeholder:text-gray-400 bg-transparent focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="bg-amber-400 hover:bg-amber-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 transition-colors px-8 py-4 font-heading font-semibold text-btn text-amber-800 shrink-0"
            >
              Search schools
            </button>
          </motion.form>

          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap gap-2 justify-center"
          >
            {TAGS.map((tag) => (
              <Link
                key={tag}
                href={`/schools?board=${tag.replace(" ", "_").toUpperCase()}`}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-heading font-semibold px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                {tag}
              </Link>
            ))}
          </motion.div>

          <motion.p variants={fadeInUp} className="text-blue-200 text-sm font-body">
            School owner?{" "}
            <Link
              href="/school-register"
              className="text-amber-300 font-heading font-semibold hover:text-amber-200 underline-offset-4 hover:underline"
            >
              List your school for free
            </Link>
          </motion.p>
        </div>
      </motion.section>
    </motion.div>
  );
}

export default function HomeHero() {
  const reduceMotion = useReducedMotion();
  return reduceMotion ? <HeroInner /> : <AnimatedHero />;
}
