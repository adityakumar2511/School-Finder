"use client";

import { motion } from "framer-motion";
import { ClipboardList, Search, Send, MessageCircle, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: <ClipboardList className="w-6 h-6" />,
    title: "School Creates Profile",
    description: "Schools register and fill in their complete profile — fees, facilities, board, gallery, and more.",
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: "Parent Discovers",
    description: "Parents search by city, board, fee range, or medium and browse matching school profiles.",
  },
  {
    icon: <Send className="w-6 h-6" />,
    title: "Parent Sends Inquiry",
    description: "Interested parents send a direct inquiry from the school's profile page.",
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "School Responds",
    description: "The school receives the inquiry in their dashboard and follows up with the parent.",
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: "Admission Happens",
    description: "Parent visits, decides, and the child gets the right school — everyone wins.",
  },
];

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const stepVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export function AboutHowItWorks() {
  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block font-body text-label font-medium text-blue-600 uppercase tracking-widest mb-3">
            How It Works
          </span>
          <h2 className="font-heading text-h2 text-gray-900 mb-4">
            Five Simple Steps
          </h2>
          <p className="font-body text-body-lg text-gray-500 max-w-xl mx-auto">
            From listing to admission — the process is straightforward for everyone involved.
          </p>
        </motion.div>

        <motion.div
          className="relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          <div className="hidden lg:block absolute top-9 left-[calc(10%+20px)] right-[calc(10%+20px)] h-px bg-gray-200 z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-4 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                variants={stepVariants}
                className="flex flex-col items-center text-center lg:px-2"
              >
                <motion.div
                  className="w-[72px] h-[72px] rounded-2xl bg-white border-2 border-blue-100 shadow-sm flex items-center justify-center text-blue-600 mb-4 relative"
                  whileHover={{ scale: 1.08, borderColor: "#3b82f6" }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  {step.icon}
                  <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-amber-400 text-amber-900 text-[11px] font-heading font-bold flex items-center justify-center shadow-sm">
                    {i + 1}
                  </span>
                </motion.div>

                <h3 className="font-heading text-body font-semibold text-gray-900 mb-2 leading-snug">
                  {step.title}
                </h3>
                <p className="font-body text-label text-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}