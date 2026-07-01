"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  intro?: string;
  children: ReactNode;
}

export default function LegalPageLayout({
  title,
  lastUpdated,
  intro,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="bg-gray-50 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="badge-premium border-info-text/20 bg-info-bg text-info-text">
            Last updated: {lastUpdated}
          </span>

          <h1 className="mt-4">{title}</h1>

          {intro && (
            <p className="mt-4 font-body text-body-lg text-gray-600">
              {intro}
            </p>
          )}
        </motion.div>

        {/* Content card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="card-premium mt-8 space-y-8"
        >
          {children}
        </motion.div>

        {/* Contact footer note */}
        <p className="mt-8 flex flex-wrap items-center justify-center gap-1.5 text-center font-body text-label text-gray-500">
          Questions about this page? Reach out via our{" "}
          <a href="/contact" className="font-medium text-blue-600 hover:text-blue-800">
            Contact page
          </a>
          , or email us at
          <a
            href="mailto:info.lakshyaone@gmail.com"
            className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden />
            info.lakshyaone@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}