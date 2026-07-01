"use client";

import { motion, Variants } from "framer-motion";
import { BookOpen, MapPin } from "lucide-react";

const slideLeft: Variants = {
  hidden: { opacity: 0, x: -48 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideRight: Variants = {
  hidden: { opacity: 0, x: 48 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

const pathDraw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.4, ease: "easeInOut", delay: 0.3 },
  },
};

const perspectives = [
  {
    icon: <MapPin className="w-5 h-5 text-blue-600" />,
    label: "For Parents",
    color: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-100 ring-1 ring-blue-200",
    text: "Searching for a school meant visiting multiple campuses, asking relatives, and comparing incomplete information from different sources — all while trying to make one of the most important decisions for their child.",
  },
  {
    icon: <BookOpen className="w-5 h-5 text-amber-600" />,
    label: "For Schools",
    color: "bg-amber-50 border-amber-100",
    iconBg: "bg-amber-100 ring-1 ring-amber-200",
    text: "Many excellent schools provide quality education with dedicated teachers and affordable fees — yet most admissions still depend on word of mouth because they have little or no online presence.",
  },
];

export function AboutStory() {
  return (
    <section className="relative py-24 bg-background overflow-hidden">
      {/* Ambient background accents */}
      <div
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-50 blur-3xl opacity-70"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-amber-50 blur-3xl opacity-70"
        aria-hidden
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <span className="inline-block font-body text-label font-medium text-blue-600 uppercase tracking-widest mb-3">
            Our Story
          </span>
          <h2 className="font-heading text-h2 text-gray-900 mb-4">
            Two Problems. One Vision.
          </h2>
          <p className="font-body text-body-lg text-gray-500 max-w-xl mx-auto">
            These are not isolated stories. They are challenges faced by
            families and schools across India every admission season.
          </p>
        </motion.div>

        {/* Two column layout */}
        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-10 lg:gap-6 items-center">
          {/* Left — story cards */}
          <motion.div
            className="space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {perspectives.map((p) => (
              <motion.div
                key={p.label}
                variants={slideLeft}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`card-premium border ${p.color} transition-shadow hover:shadow-lg`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl ${p.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                  >
                    {p.icon}
                  </div>
                  <div>
                    <span className="inline-block font-heading text-label font-semibold text-gray-900 mb-2">
                      {p.label}
                    </span>
                    <p className="font-body text-body text-gray-600 leading-relaxed">
                      {p.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Center — convergence connector (desktop only) */}
          <div
            className="hidden lg:flex h-full min-h-[280px] w-16 items-center justify-center"
            aria-hidden
          >
            <svg
              viewBox="0 0 64 280"
              width="64"
              height="280"
              fill="none"
              className="h-full w-full"
            >
              <motion.path
                d="M0 40 C 32 40, 32 140, 32 140 C 32 140, 32 240, 64 240"
                stroke="#93C5FD"
                strokeWidth="2"
                strokeLinecap="round"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={pathDraw}
              />
              <motion.path
                d="M0 240 C 32 240, 32 140, 32 140"
                stroke="#FCD34D"
                strokeWidth="2"
                strokeLinecap="round"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={pathDraw}
              />
              <motion.circle
                cx="32"
                cy="140"
                r="6"
                fill="url(#convergeDot)"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 18 }}
              />
              <defs>
                <linearGradient id="convergeDot" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Right — resolution text */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="space-y-6"
          >
            <motion.div variants={slideRight}>
              {/* <div className="w-1 h-12 bg-gradient-to-b from-blue-600 to-amber-400 rounded-full mb-6" /> */}
              <h3 className="font-heading text-h3 text-gray-900 mb-4">
                Bridging the Gap
              </h3>
              <p className="font-body text-body text-gray-600 leading-relaxed mb-4">
                Lakshya One was created to make school discovery easier for parents
                and help schools build a stronger digital presence — starting with
                the cities that need it most.
              </p>
              <p className="font-body text-body text-gray-600 leading-relaxed mb-4">
                We bring detailed school information — fees, facilities, board
                affiliations, gallery, and more — into one place, and make it easy
                for parents to connect directly with the schools they care about.
              </p>
              <p className="font-body text-body text-gray-600 leading-relaxed">
                Because every school deserves the opportunity to be discovered,
                and every family deserves the tools to make a confident decision.
              </p>
            </motion.div>

            {/* Highlight quote — signature card */}
            <motion.blockquote
              variants={slideRight}
              className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-blue-50 via-white to-amber-50 p-6 sm:p-7 shadow-sm"
            >
              <svg
                width="36"
                height="28"
                viewBox="0 0 36 28"
                fill="none"
                className="mb-3 text-amber-400"
                aria-hidden
              >
                <path
                  d="M14.4 0C6.4 3.6 0 11.2 0 19.6C0 24.4 3.6 28 8.4 28C12.8 28 16 24.4 16 20.4C16 16.4 13.2 13.6 9.6 13.6C9.2 13.6 8.8 13.6 8.4 13.6C9.2 8.4 12.4 4.4 17.2 2L14.4 0ZM32 0C24 3.6 17.6 11.2 17.6 19.6C17.6 24.4 21.2 28 26 28C30.4 28 33.6 24.4 33.6 20.4C33.6 16.4 30.8 13.6 27.2 13.6C26.8 13.6 26.4 13.6 26 13.6C26.8 8.4 30 4.4 34.8 2L32 0Z"
                  fill="currentColor"
                />
              </svg>
              <p className="font-heading text-h3 font-semibold text-gray-800 leading-snug">
                Simple for parents. Powerful for schools. Built for every town
                and city in India.
              </p>
            </motion.blockquote>
          </motion.div>
        </div>
      </div>
    </section>
  );
}