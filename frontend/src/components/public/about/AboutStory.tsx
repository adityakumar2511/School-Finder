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

const perspectives = [
  {
    icon: <MapPin className="w-5 h-5 text-blue-600" />,
    label: "For Parents",
    color: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-100",
    text: "Searching for a school meant visiting multiple campuses, asking relatives, and comparing incomplete information from different sources — all while trying to make one of the most important decisions for their child.",
  },
  {
    icon: <BookOpen className="w-5 h-5 text-amber-600" />,
    label: "For Schools",
    color: "bg-amber-50 border-amber-100",
    iconBg: "bg-amber-100",
    text: "Many excellent schools provide quality education with dedicated teachers and affordable fees — yet most admissions still depend on word of mouth because they have little or no online presence.",
  },
];

export function AboutStory() {
  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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
                className={`card-premium border ${p.color}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl ${p.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}
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

          {/* Right — resolution text */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="space-y-6"
          >
            <motion.div variants={slideRight}>
              <div className="w-1 h-12 bg-gradient-to-b from-blue-600 to-amber-400 rounded-full mb-6" />
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

            {/* Highlight quote */}
            <motion.blockquote
              variants={slideRight}
              className="relative pl-5 border-l-4 border-amber-400"
            >
              <p className="font-heading text-h3 font-semibold text-gray-800 leading-snug">
                "Simple for parents. Powerful for schools. Built for every town
                and city in India."
              </p>
            </motion.blockquote>
          </motion.div>
        </div>
      </div>
    </section>
  );
}