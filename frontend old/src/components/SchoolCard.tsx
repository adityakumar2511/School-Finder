"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { fadeInUp } from "@/lib/motion";
import { IMAGE_BLUR_DATA_URL } from "@/lib/image-placeholder";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";
import { cn } from "@/lib/utils";

export interface SchoolCardProps {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  board: "CBSE" | "ICSE" | "UP_BOARD" | "OTHER";
  schoolType: "BOYS" | "GIRLS" | "CO_ED";
  medium: "HINDI" | "ENGLISH" | "BOTH";
  classesFrom: number;
  classesTo: number;
  tuitionFeeMonthly?: number | null;
  logoUrl?: string | null;
  facilitiesCount?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  index?: number;
}

const BOARD_LABELS: Record<SchoolCardProps["board"], string> = {
  CBSE: "CBSE",
  ICSE: "ICSE",
  UP_BOARD: "UP Board",
  OTHER: "Other",
};

const TYPE_LABELS: Record<SchoolCardProps["schoolType"], string> = {
  BOYS: "Boys",
  GIRLS: "Girls",
  CO_ED: "Co-Ed",
};

const MEDIUM_LABELS: Record<SchoolCardProps["medium"], string> = {
  HINDI: "Hindi",
  ENGLISH: "English",
  BOTH: "Bilingual",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function SchoolCardComponent({
  name,
  slug,
  city,
  state,
  board,
  schoolType,
  medium,
  classesFrom,
  classesTo,
  tuitionFeeMonthly,
  logoUrl,
  facilitiesCount,
  index = 0,
}: SchoolCardProps) {
  const reduceMotion = useReducedMotion();
  const optimizedLogoUrl = optimizeCloudinaryUrl(logoUrl, { width: 128 });

  const card = (
    <Link
      href={`/schools/${slug}`}
      className={cn(
        "group block rounded-2xl border border-gray-100 bg-white shadow-card overflow-hidden",
        "transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1",
        "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      )}
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-700 via-blue-500 to-amber-400" />

      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-sm flex items-center justify-center ring-2 ring-white">
            {optimizedLogoUrl ? (
              <Image
                src={optimizedLogoUrl}
                alt=""
                width={64}
                height={64}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading="lazy"
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_DATA_URL}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <span className="font-heading font-bold text-blue-600 text-xl leading-none">
                {getInitials(name)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-heading font-semibold text-h3 text-gray-800 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
              {name}
            </h3>
            <p className="font-body text-label text-gray-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-400" aria-hidden />
              <span className="truncate">
                {city}, {state}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="badge-premium bg-info-bg text-info-text border-blue-200">
            {BOARD_LABELS[board]}
          </span>
          <span className="badge-premium bg-blue-50 text-blue-700 border-blue-100">
            {TYPE_LABELS[schoolType]}
          </span>
          <span className="badge-premium bg-gray-50 text-gray-600 border-gray-100">
            {MEDIUM_LABELS[medium]}
          </span>
        </div>

        <div className="border-t border-gray-100 pt-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-body text-meta text-gray-400 uppercase tracking-wide">
              Classes
            </p>
            <p className="font-heading font-semibold text-label text-gray-700">
              {classesFrom}–{classesTo}
            </p>
            {typeof facilitiesCount === "number" && facilitiesCount > 0 && (
              <p className="font-body text-meta text-gray-400 mt-1">
                {facilitiesCount} facilities
              </p>
            )}
          </div>

          {tuitionFeeMonthly ? (
            <div className="text-right shrink-0">
              <p className="font-body text-meta text-gray-400">From</p>
              <p className="font-heading font-bold text-blue-600 text-body-lg tabular-nums">
                ₹{tuitionFeeMonthly.toLocaleString("en-IN")}
              </p>
              <p className="font-body text-meta text-gray-400">/ month</p>
            </div>
          ) : (
            <span className="font-body text-meta text-gray-400 italic shrink-0">
              Fee on request
            </span>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
          <span className="font-heading text-sm font-semibold text-blue-600 group-hover:text-blue-800 transition-colors">
            View profile
          </span>
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all group-hover:bg-blue-600 group-hover:text-white"
            aria-hidden
          >
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );

  if (reduceMotion) return card;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
    >
      {card}
    </motion.div>
  );
}

const SchoolCard = memo(SchoolCardComponent);
SchoolCard.displayName = "SchoolCard";

export default SchoolCard;
