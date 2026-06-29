import Link from "next/link";
import { ArrowRight, Building2, GraduationCap } from "lucide-react";

export default function HomeFinalCTA() {
  return (
    <section
      className="bg-hero-gradient px-4 py-16 text-white sm:px-6 lg:px-8"
      aria-labelledby="final-cta-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="final-cta-heading"
            className="font-heading text-3xl font-bold text-white sm:text-4xl"
          >
            Every Great Future Starts with the Right School.
          </h2>
          <p className="mt-4 font-body text-blue-100">
            Whether you&apos;re searching for the best school for your child or
            helping your school reach more families, Lakshya One is here to make
            the journey easier.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-center backdrop-blur-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/20">
              <GraduationCap className="h-6 w-6 text-amber-300" aria-hidden />
            </div>
            <h3 className="font-heading text-2xl font-bold text-white">
              For Parents
            </h3>
            <p className="mt-3 font-body text-blue-100">
              Explore schools, compare options, and connect directly with
              schools.
            </p>
            <Link href="/schools" className="btn-cta mt-6">
              Find a School
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-center backdrop-blur-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/20">
              <Building2 className="h-6 w-6 text-amber-300" aria-hidden />
            </div>
            <h3 className="font-heading text-2xl font-bold text-white">
              For Schools
            </h3>
            <p className="mt-3 font-body text-blue-100">
              Create your school&apos;s profile and help more parents discover
              your institution.
            </p>
            <Link href="/school-register" className="btn-cta mt-6">
              Get Your School Listed
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="font-heading text-2xl font-bold text-white">
            Lakshya One
          </p>
          <p className="mt-2 font-body text-blue-200">
            The Right School. The Right Student. One Platform.
          </p>
        </div>
      </div>
    </section>
  );
}