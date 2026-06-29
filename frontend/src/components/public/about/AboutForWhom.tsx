"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, BarChart2, MessageCircle, Image, SlidersHorizontal,
  Globe, Inbox, UserCheck, TrendingUp, Share2,
} from "lucide-react";

const tabs = ["For Parents", "For Schools"] as const;
type Tab = (typeof tabs)[number];

const features: Record<Tab, { icon: React.ReactNode; title: string; description: string }[]> = {
  "For Parents": [
    { icon: <Search className="w-5 h-5" />, title: "Search & Filter", description: "Find schools by board, fees, location, medium, and more — all in one place." },
    { icon: <BarChart2 className="w-5 h-5" />, title: "Compare Schools", description: "Side-by-side comparison of facilities, fees, and academics to help you decide confidently." },
    { icon: <MessageCircle className="w-5 h-5" />, title: "Direct Inquiry", description: "Send your interest directly to the school — no middlemen, no delays." },
    { icon: <Image className="w-5 h-5" />, title: "Gallery & Facilities", description: "Browse photos of campus, classrooms, sports facilities, and infrastructure before visiting." },
    { icon: <SlidersHorizontal className="w-5 h-5" />, title: "Smart Filters", description: "Narrow down by fee range, distance, affiliation board, and available seats." },
  ],
  "For Schools": [
    { icon: <Globe className="w-5 h-5" />, title: "Digital Presence", description: "Get a complete, SEO-optimised school profile that parents can discover online." },
    { icon: <Inbox className="w-5 h-5" />, title: "Inquiry Management", description: "Receive and manage parent inquiries from a single dashboard." },
    { icon: <UserCheck className="w-5 h-5" />, title: "Rich Profile", description: "Showcase your fees, academics, facilities, gallery, and staff in a structured format." },
    { icon: <TrendingUp className="w-5 h-5" />, title: "SEO Visibility", description: "Rank for searches like 'CBSE school in [city]' without running ads." },
    { icon: <Share2 className="w-5 h-5" />, title: "Social Ready", description: "Export your school profile for social media and WhatsApp marketing in one click." },
  ],
};

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

export function AboutForWhom() {
  const [active, setActive] = useState<Tab>("For Parents");

  return (
    <section className="py-24 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block font-body text-label font-medium text-blue-600 uppercase tracking-widest mb-3">
            Who It's For
          </span>
          <h2 className="font-heading text-h2 text-gray-900 mb-4">
            Built for Both Sides
          </h2>
          <p className="font-body text-body-lg text-gray-500 max-w-xl mx-auto">
            Whether you're a parent searching or a school growing — Lakshya One works for you.
          </p>
        </motion.div>

        <motion.div
          className="flex justify-center mb-10"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="inline-flex rounded-xl border border-gray-200 bg-gray-100 p-1 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`relative px-6 py-2.5 rounded-lg font-heading text-btn font-semibold transition-colors duration-200 ${
                  active === tab ? "text-white" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {active === tab && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-lg bg-blue-600"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {features[active].map((f) => (
                <motion.div
                  key={f.title}
                  variants={itemVariants}
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="card-premium border border-gray-100 bg-white"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    {f.icon}
                  </div>
                  <h3 className="font-heading text-body font-semibold text-gray-900 mb-1.5">
                    {f.title}
                  </h3>
                  <p className="font-body text-body text-gray-500 leading-relaxed">
                    {f.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}