"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, MapPin, Users } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/lib/ui/motion";

const STATS = [
  { icon: BookOpen, stat: "500+", label: "Schools listed" },
  { icon: MapPin, stat: "10+", label: "Cities covered" },
  { icon: Users, stat: "Free", label: "To browse & compare" },
];

export default function HomeStats() {
  const reduceMotion = useReducedMotion();

  const items = STATS.map((item) => (
    <div
      key={item.label}
      className="flex items-center justify-center sm:justify-start gap-4 rounded-2xl bg-white/5 border border-white/10 px-6 py-4"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/20">
        <item.icon className="w-5 h-5 text-amber-400" aria-hidden />
      </div>
      <div className="text-left">
        <p className="font-heading font-bold text-2xl text-white leading-none tabular-nums">
          {item.stat}
        </p>
        <p className="font-body text-sm text-blue-200 mt-1">{item.label}</p>
      </div>
    </div>
  ));

  return (
    <section
      className="bg-blue-900/95 text-white border-y border-blue-800"
      aria-label="Platform statistics"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {reduceMotion ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4">{items}</div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {STATS.map((item) => (
              <motion.div key={item.label} variants={fadeInUp}>
                <div className="flex items-center justify-center sm:justify-start gap-4 rounded-2xl bg-white/5 border border-white/10 px-6 py-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/20">
                    <item.icon className="w-5 h-5 text-amber-400" aria-hidden />
                  </div>
                  <div className="text-left">
                    <p className="font-heading font-bold text-2xl text-white leading-none tabular-nums">
                      {item.stat}
                    </p>
                    <p className="font-body text-sm text-blue-200 mt-1">{item.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
