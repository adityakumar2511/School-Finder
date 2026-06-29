import Link from "next/link";
import { ArrowRight, CheckCircle2, Users } from "lucide-react";
import { PARENT_POINTS } from "@/components/public/home/home-data";

export default function HomeParentsSection() {
  return (
    <section
      className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8"
      aria-labelledby="parents-heading"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
        <div className="card-premium bg-white">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
            <Users className="h-6 w-6 text-blue-600" aria-hidden />
          </div>

          <h2
            id="parents-heading"
            className="font-heading text-3xl font-bold text-blue-800"
          >
            Helping Parents Make Better School Decisions
          </h2>

          <p className="mt-4 font-body text-gray-500">
            Choosing a school is one of the biggest decisions every family
            makes. Lakshya One makes that journey easier by bringing useful
            school information together in one place.
          </p>

          <Link href="/schools" className="btn-primary mt-7">
            Find a School
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div>
          <p className="font-heading text-sm font-semibold uppercase tracking-wide text-amber-600">
            Why Parents Choose Lakshya One
          </p>
          <h3 className="mt-2 font-heading text-2xl font-bold text-blue-800">
            Parents Can
          </h3>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PARENT_POINTS.map((point) => (
              <div
                key={point}
                className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4"
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
            Helping families make informed decisions with confidence.
          </p>
        </div>
      </div>
    </section>
  );
}