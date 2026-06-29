import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

export default function HomeAvailableCity() {
  return (
    <section
      className="bg-blue-900 px-4 py-16 text-white sm:px-6 lg:px-8"
      aria-labelledby="available-city-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <p className="font-heading text-sm font-semibold uppercase tracking-wide text-amber-300">
              Currently Available
            </p>
            <h2
              id="available-city-heading"
              className="mt-2 font-heading text-3xl font-bold text-white"
            >
              Starting Our Journey from Prayagraj
            </h2>
            <p className="mt-4 max-w-3xl font-body text-blue-200">
              Lakshya One is currently available in{" "}
              <strong className="text-white">Prayagraj, Uttar Pradesh</strong>.
              We&apos;re building our platform city by city to ensure a better
              experience for both parents and schools before expanding to more
              locations across India.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/20">
              <MapPin className="h-6 w-6 text-amber-300" aria-hidden />
            </div>

            <p className="font-heading text-sm font-semibold text-blue-200">
              Available City
            </p>
            <h3 className="mt-2 font-heading text-2xl font-bold text-white">
              Prayagraj, Uttar Pradesh
            </h3>
            <p className="mt-2 font-body text-sm text-blue-200">
              More cities will be added soon.
            </p>

            <Link href="/schools?city=Prayagraj" className="btn-cta mt-6">
              Explore Schools in Prayagraj
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}