import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2 } from "lucide-react";
import { SCHOOL_POINTS } from "@/components/public/home/home-data";

export default function HomeSchoolsSection() {
  return (
    <section
      className="bg-white px-4 py-16 sm:px-6 lg:px-8"
      aria-labelledby="schools-heading"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="font-heading text-sm font-semibold uppercase tracking-wide text-amber-600">
            Why Schools Choose Lakshya One
          </p>
          <h2
            id="schools-heading"
            className="mt-2 font-heading text-3xl font-bold text-blue-800"
          >
            Give Your School the Digital Presence It Deserves
          </h2>

          <p className="mt-4 font-body text-gray-500">
            Many parents begin their school search online. Lakshya One helps
            schools build their online presence and become easier for parents to
            discover.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SCHOOL_POINTS.map((point) => (
              <div
                key={point}
                className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4"
              >
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-success-text"
                  aria-hidden
                />
                <p className="font-body text-sm font-medium text-gray-700">
                  {point}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-6 font-body text-gray-500">
            Helping schools connect with more families.
          </p>
        </div>

        <div className="card-premium bg-card-gradient">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
            <Building2 className="h-6 w-6 text-amber-600" aria-hidden />
          </div>

          <h3 className="font-heading text-2xl font-bold text-blue-800">
            Create your school profile
          </h3>
          <p className="mt-3 font-body text-gray-500">
            Showcase your school&apos;s academics, facilities, achievements,
            admission details, contact information, and campus photos in one
            professional profile.
          </p>

          <Link href="/school-register" className="btn-cta mt-7">
            Get Your School Listed
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}