"use client";

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  GitCompare,
  MapPin,
  Star,
} from "lucide-react";
import { fadeInUp } from "@/lib/ui/motion";
import { IMAGE_BLUR_DATA_URL } from "@/lib/upload/image-placeholder";
import { optimizeCloudinaryUrl } from "@/lib/upload/cloudinary-url";
import { cn } from "@/lib/utils";

const COMPARE_STORAGE_KEY = "schoolfinder_compare_schools";
const MAX_COMPARE = 3;

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
  isFeatured?: boolean;
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

function readCompareSchools(): SchoolCardProps[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(COMPARE_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (school): school is SchoolCardProps =>
        Boolean(school?.id) &&
        Boolean(school?.name) &&
        Boolean(school?.slug),
    );
  } catch {
    return [];
  }
}

function writeCompareSchools(schools: SchoolCardProps[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(schools));
  window.dispatchEvent(new Event("schoolfinder:compare-updated"));
}

function SchoolCardComponent(props: SchoolCardProps) {
  const {
    id,
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
    isFeatured,
  } = props;

  const reduceMotion = useReducedMotion();
  const optimizedLogoUrl = optimizeCloudinaryUrl(logoUrl, { width: 128 });
  const [isInCompare, setIsInCompare] = useState(false);

  useEffect(() => {
    const syncCompareState = () => {
      const currentSchools = readCompareSchools();
      setIsInCompare(currentSchools.some((school) => school.id === id));
    };

    syncCompareState();

    window.addEventListener("storage", syncCompareState);
    window.addEventListener("schoolfinder:compare-updated", syncCompareState);

    return () => {
      window.removeEventListener("storage", syncCompareState);
      window.removeEventListener(
        "schoolfinder:compare-updated",
        syncCompareState,
      );
    };
  }, [id]);

  function handleCompareClick() {
    const currentSchools = readCompareSchools();
    const alreadyAdded = currentSchools.some((school) => school.id === id);

    if (alreadyAdded) {
      const nextSchools = currentSchools.filter((school) => school.id !== id);
      writeCompareSchools(nextSchools);
      setIsInCompare(false);
      return;
    }

    if (currentSchools.length >= MAX_COMPARE) {
      alert("You can compare maximum 3 schools at a time.");
      return;
    }

    const nextSchools = [...currentSchools, props];
    writeCompareSchools(nextSchools);
    setIsInCompare(true);
  }

  const card = (
    <article
      className={cn(
        "group rounded-2xl border border-gray-100 bg-white shadow-card overflow-hidden relative",
        "transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1",
        "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
      )}
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-700 via-blue-500 to-amber-400" />

      {isFeatured && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold shadow-sm">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            Featured
          </span>
        </div>
      )}

      <div className="p-5">
        <Link href={`/schools/${slug}`} className="block">
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
                <MapPin
                  className="w-3.5 h-3.5 shrink-0 text-blue-400"
                  aria-hidden
                />
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
        </Link>

        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between gap-3">
          <Link
            href={`/schools/${slug}`}
            className="inline-flex items-center gap-2 font-heading text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            View profile
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all group-hover:bg-blue-600 group-hover:text-white"
              aria-hidden
            >
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          <button
            type="button"
            onClick={handleCompareClick}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-heading font-semibold transition-colors",
              isInCompare
                ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
            )}
          >
            {isInCompare ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <GitCompare className="w-4 h-4" />
            )}
            {isInCompare ? "Added" : "Compare"}
          </button>
        </div>
      </div>
    </article>
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