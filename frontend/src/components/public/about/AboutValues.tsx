"use client";

import { motion } from "framer-motion";
import { Heart, Eye, Zap, TrendingUp } from "lucide-react";

const values = [
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Accessibility",
    description: "Every school — regardless of size or budget — deserves a platform to reach families. We keep our free tier genuinely useful.",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Transparency",
    description: "Real information — actual fees, actual facilities, actual photos. No misleading claims, no hidden fine print.",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Simplicity",
    description: "Parents shouldn't need a tutorial to find a school. Everything on Lakshya One is designed to be obvious on first use.",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Growth",
    description: "We grow when schools grow. Our success is measured by admissions made easier, not metrics on a dashboard.",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 24 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.55, ease } },
};

export function AboutValues() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block font-body text-label font-medium text-blue-600 uppercase tracking-widest mb-3">
            Our Values
          </span>
          <h2 className="font-heading text-h2 text-gray-900 mb-4">
            What We Stand For
          </h2>
          <p className="font-body text-body-lg text-gray-500 max-w-xl mx-auto">
            The principles that guide every product decision we make.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {values.map((v) => (
            <motion.div
              key={v.title}
              variants={cardVariants}
              whileHover={{ y: -5, boxShadow: "0 12px 32px -8px rgba(0,0,0,0.10)" }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="card-premium border border-gray-100 bg-white flex gap-5 items-start"
            >
              <div className={`w-12 h-12 rounded-xl ${v.iconBg} ${v.iconColor} flex items-center justify-center flex-shrink-0`}>
                {v.icon}
              </div>
              <div>
                <h3 className="font-heading text-body font-semibold text-gray-900 mb-1.5">
                  {v.title}
                </h3>
                <p className="font-body text-body text-gray-500 leading-relaxed">
                  {v.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}