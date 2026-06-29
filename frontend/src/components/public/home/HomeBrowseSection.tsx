"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Map } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/ui/motion";

const CITIES = [
  { name: "Prayagraj", state: "Uttar Pradesh", slug: "prayagraj", available: true },
  { name: "Lucknow", state: "Uttar Pradesh", slug: "lucknow", available: false },
  { name: "Varanasi", state: "Uttar Pradesh", slug: "varanasi", available: false },
  { name: "Kanpur", state: "Uttar Pradesh", slug: "kanpur", available: false },
];

function BrowseContent() {
  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      aria-labelledby="browse-heading"
    >
      <div className="text-center mb-12">
        <span className="inline-block bg-blue-50 text-blue-800 text-xs font-heading font-semibold px-3 py-1.5 rounded-full mb-4 border border-blue-200">
          Explore Schools
        </span>
        <h2
          id="browse-heading"
          className="font-heading font-bold text-h2 text-gray-900 tracking-tight"
        >
          Start your school search
        </h2>
        <p className="mt-3 font-body text-gray-500 max-w-xl mx-auto">
          Choose your location and begin exploring schools near you. Finding the right school starts with finding the right city.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Browse by State */}
        <div className="card-premium flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Map className="w-5 h-5 text-blue-600" aria-hidden />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-gray-900">
                Browse by state
              </h3>
              <p className="font-body text-sm text-gray-500">
                Explore schools across India, state by state
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {["Uttar Pradesh", "Delhi", "Maharashtra", "Rajasthan", "Bihar"].map(
              (state) => (
                <Link
                  key={state}
                  href={`/schools/state/${state.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-heading font-semibold border transition-colors ${
                    state === "Uttar Pradesh"
                      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-800 hover:border-blue-800"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-700"
                  }`}
                >
                  {state}
                  {state === "Uttar Pradesh" && (
                    <span className="text-xs bg-white/20 text-white px-1.5 py-0.5 rounded-full">
                      Available
                    </span>
                  )}
                </Link>
              )
            )}
          </div>

          <Link
            href="/schools?state=uttar-pradesh"
            className="btn-primary mt-auto self-start"
            aria-label="Browse all schools by state"
          >
            Browse states
          </Link>
        </div>

        {/* Browse by City */}
        <div className="card-premium flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <MapPin className="w-5 h-5 text-amber-600" aria-hidden />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-gray-900">
                Browse by city
              </h3>
              <p className="font-body text-sm text-gray-500">
                Currently available in select cities
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {CITIES.map((city) => (
              <div
                key={city.name}
                className={`flex items-center justify-between rounded-xl px-4 py-3 border transition-colors ${
                  city.available
                    ? "border-blue-200 bg-blue-50 hover:bg-blue-100"
                    : "border-gray-100 bg-gray-50 opacity-60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MapPin
                    className={`w-4 h-4 ${city.available ? "text-blue-600" : "text-gray-400"}`}
                    aria-hidden
                  />
                  <div>
                    <span
                      className={`font-heading font-semibold text-sm ${
                        city.available ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {city.name}
                    </span>
                    <span className="font-body text-xs text-gray-400 ml-2">
                      {city.state}
                    </span>
                  </div>
                </div>
                {city.available ? (
                  <Link
                    href={`/schools/city/${city.slug}`}
                    className="text-xs font-heading font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    aria-label={`Explore schools in ${city.name}`}
                  >
                    Explore →
                  </Link>
                ) : (
                  <span className="text-xs font-body text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
                    Coming soon
                  </span>
                )}
              </div>
            ))}
          </div>

          <Link
            href="/schools/city/prayagraj"
            className="btn-cta mt-auto self-start"
            aria-label="Explore schools in Prayagraj"
          >
            Explore Prayagraj schools
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomeBrowseSection() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <BrowseContent />;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer}
    >
      <motion.div variants={fadeInUp}>
        <BrowseContent />
      </motion.div>
    </motion.div>
  );
}