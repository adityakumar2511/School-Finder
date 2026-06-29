"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is Lakshya One free for schools?",
    answer:
      "Yes — schools can create and maintain a complete profile on Lakshya One at no cost. Our free plan includes full profile setup, gallery, fee display, and inquiry reception. Premium plans with additional visibility features are available for schools that want more reach.",
  },
  {
    question: "How do parents contact a school through the platform?",
    answer:
      "Parents can send a direct inquiry from any school's profile page. The school receives it in their dashboard and can follow up directly. There are no intermediaries — the communication goes straight to the school.",
  },
  {
    question: "Which cities and boards does Lakshya One cover?",
    answer:
      "We're currently focused on Tier 2 and Tier 3 cities across India — places where good schools exist but lack digital visibility. We support all major boards: CBSE, ICSE, State Board, and IB. Coverage is expanding city by city.",
  },
  {
    question: "How do I list my school on Lakshya One?",
    answer:
      "Click 'List Your School' from the homepage or About page, complete the registration form, and our team will verify and activate your profile within 24-48 hours. The whole process takes under 15 minutes.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-heading text-body font-semibold text-gray-900">
          {question}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-shrink-0 text-gray-400"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="font-body text-body text-gray-500 leading-relaxed pb-5">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AboutFAQ() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block font-body text-label font-medium text-blue-600 uppercase tracking-widest mb-3">
            FAQ
          </span>
          <h2 className="font-heading text-h2 text-gray-900 mb-4">
            Common Questions
          </h2>
          <p className="font-body text-body-lg text-gray-500">
            Everything you need to know before getting started.
          </p>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl border border-gray-100 px-6 shadow-sm"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {faqs.map((faq) => (
            <FAQItem key={faq.question} {...faq} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}