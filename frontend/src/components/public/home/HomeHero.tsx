import Link from "next/link";
import {
  ArrowRight,
  Building2,
  GraduationCap,
  Search,
  Sparkles,
} from "lucide-react";

const QUICK_SEARCHES = [
  { label: "CBSE", href: "/schools?board=CBSE" },
  { label: "ICSE", href: "/schools?board=ICSE" },
  { label: "State Board", href: "/schools?board=STATE_BOARD" },
  { label: "Prayagraj", href: "/schools?city=Prayagraj" },
];

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-hero-gradient text-white">
      <div
        className="absolute inset-0 bg-subtle-pattern opacity-60 pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none"
        aria-hidden
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/20 px-3 py-1.5 font-heading text-xs font-semibold text-amber-200">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            School discovery made simple
          </span>

          <h1 className="mt-7 font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-display-lg">
            The Right School.{" "}
            <span className="text-amber-400">The Right Student.</span> One
            Platform.
          </h1>

          <p className="mx-auto mt-6 max-w-3xl font-body text-base leading-relaxed text-blue-100 sm:text-lg">
            Lakshya One helps parents discover and compare schools in one place
            while helping schools build a professional digital presence and
            connect with more families.
          </p>

          <p className="mx-auto mt-4 max-w-3xl font-body text-sm leading-relaxed text-blue-200 sm:text-base">
            Whether you&apos;re searching for the right school for your child or
            looking to showcase your school online, Lakshya One brings both
            together through one simple and trusted platform.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/schools" className="btn-cta w-full sm:w-auto">
              <GraduationCap className="mr-2 h-4 w-4" aria-hidden />
              Find a School
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>

            <Link
              href="/school-register"
              className="inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 font-heading text-sm font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:w-auto"
            >
              <Building2 className="mr-2 h-4 w-4" aria-hidden />
              Get Your School Listed
            </Link>
          </div>

          {/* Search bar */}
          {/* Search bar */}
          <div className="mx-auto mt-12 max-w-2xl">
            <form
              action="/schools"
              method="GET"
              role="search"
              aria-label="Search schools"
              className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg shadow-blue-950/20 sm:flex-row"
            >
              <div className="flex flex-1 items-center gap-3 px-4">
                <Search
                  className="h-5 w-5 shrink-0 text-blue-500"
                  aria-hidden
                />
                <label htmlFor="hero-search" className="sr-only">
                  Search schools
                </label>
                <input
                  id="hero-search"
                  name="search"
                  type="search"
                  placeholder="Search schools by name, city, board or locality..."
                  className="h-14 w-full bg-transparent font-body text-sm text-gray-900 outline-none placeholder:text-gray-400"
                />
              </div>

              <button
                type="submit"
                className="group flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 font-heading text-sm font-semibold text-blue-950 transition-all hover:from-amber-300 hover:to-amber-400 focus:outline-none sm:min-h-14"
              >
                Search
                <Search className="h-4 w-4 transition-transform group-hover:scale-110" />
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {QUICK_SEARCHES.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 font-heading text-xs font-semibold text-blue-100 backdrop-blur-sm transition-all hover:border-amber-300/60 hover:bg-amber-400/20 hover:text-amber-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
