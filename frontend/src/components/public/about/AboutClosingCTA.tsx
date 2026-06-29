"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { School, Users, ArrowRight } from "lucide-react";

const cards = [
  {
    icon: <Users className="w-7 h-7" />,
    audience: "For Parents",
    headline: "Find the Right School",
    body: "Search verified school profiles, compare fees and facilities, and send inquiries — all in one place.",
    cta: "Find a School",
    href: "/schools",
    iconBg: "bg-blue-800/40",
    iconColor: "text-blue-200",
    ctaClass: "bg-amber-400 text-amber-900 hover:bg-amber-500",
  },
  {
    icon: <School className="w-7 h-7" />,
    audience: "For Schools",
    headline: "Get Discovered by Parents",
    body: "List your school on Lakshya One and start receiving parent inquiries — at zero cost to begin.",
    cta: "List Your School",
    href: "/school-register",
    iconBg: "bg-amber-400/20",
    iconColor: "text-amber-300",
    ctaClass: "bg-white text-blue-900 hover:bg-blue-50",
  },
];

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
};

export function AboutClosingCTA() {
  return (
    <section className="py-24 bg-hero-gradient overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease }}
        >
          <h2 className="font-heading text-h2 text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="font-body text-body-lg text-blue-200 max-w-lg mx-auto">
            Simple for parents. Powerful for schools. Built for every town and city in India.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {cards.map((card) => (
            <motion.div
              key={card.audience}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="rounded-2xl border border-blue-400/20 bg-blue-800/30 backdrop-blur-sm p-8 flex flex-col gap-5"
            >
              <div className={`w-14 h-14 rounded-2xl ${card.iconBg} ${card.iconColor} flex items-center justify-center`}>
                {card.icon}
              </div>
              <div>
                <span className="font-body text-label text-blue-300 uppercase tracking-widest">
                  {card.audience}
                </span>
                <h3 className="font-heading text-h3 text-white mt-1 mb-2">
                  {card.headline}
                </h3>
                <p className="font-body text-body text-blue-200 leading-relaxed">
                  {card.body}
                </p>
              </div>
              <Link
                href={card.href}
                className={`inline-flex items-center gap-2 self-start rounded-xl px-5 py-3 font-heading text-btn font-semibold transition-colors ${card.ctaClass}`}
              >
                {card.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}