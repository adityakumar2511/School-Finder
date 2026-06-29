import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import {
  PLATFORM_CARDS,
  PLATFORM_HIGHLIGHTS,
} from "@/components/public/home/home-data";

export default function HomePlatformPreview() {
  return (
    <section
      className="bg-white px-4 py-16 sm:px-6 lg:px-8"
      aria-labelledby="platform-preview-heading"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="font-heading text-sm font-semibold uppercase tracking-wide text-amber-600">
            Platform Preview
          </p>
          <h2
            id="platform-preview-heading"
            className="mt-2 font-heading text-3xl font-bold text-blue-800"
          >
            Designed for Parents. Built for Schools.
          </h2>

          <p className="mt-4 font-body text-gray-500">
            Lakshya One offers an intuitive experience that makes school
            discovery easy while giving schools a professional way to present
            themselves online.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PLATFORM_HIGHLIGHTS.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success-text" aria-hidden />
                <span className="font-body text-sm font-medium text-gray-700">
                  {item}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-6 font-heading text-xl font-bold text-blue-800">
            Simple. Clean. Easy to use.
          </p>

          <Link href="/schools" className="btn-primary mt-7">
            Explore the Platform
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-card-gradient p-6 shadow-card">
          <div className="grid grid-cols-1 gap-4">
            {PLATFORM_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                  <card.icon className="h-5 w-5 text-blue-600" aria-hidden />
                </div>
                <h3 className="font-heading text-lg font-semibold text-blue-800">
                  {card.title}
                </h3>
                <p className="mt-2 font-body text-sm text-gray-500">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}