import Link from "next/link";
import { Search, GraduationCap, MapPin, Building2 } from "lucide-react";

const QUICK_SEARCHES = [
  { label: "CBSE", href: "/schools?board=CBSE" },
  { label: "ICSE", href: "/schools?board=ICSE" },
  { label: "State Board", href: "/schools?board=STATE_BOARD" },
  { label: "Prayagraj", href: "/schools?city=Prayagraj" },
];

export default function HomeSearch() {
  return (
    <section
      className="bg-white relative z-10 -mt-16 px-4 sm:px-6 lg:px-8"
      aria-labelledby="home-search-heading"
    >
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/90 p-6 shadow-2xl shadow-blue-900/15 backdrop-blur-xl sm:p-8">
          {/* decorative gradient blob */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-gradient-to-br from-orange-300/30 to-blue-400/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-gradient-to-tr from-blue-300/20 to-orange-200/20 blur-3xl" />

          <div className="relative mb-6 text-center">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 font-heading text-xs font-semibold text-orange-600">
              <Search className="h-3 w-3" />
              Find Your Perfect School
            </span>
            <h2
              id="home-search-heading"
              className="font-heading text-2xl font-bold tracking-tight text-blue-900 sm:text-3xl"
            >
              Search Schools
            </h2>
            <p className="mt-1.5 font-body text-sm text-gray-500">
              Search schools by name, city, board or locality.
            </p>
          </div>

          <form
            action="/schools"
            method="GET"
            role="search"
            aria-label="Search schools"
            className="relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-colors focus-within:border-blue-500 sm:flex-row"
          >
            <div className="flex flex-1 items-center gap-3 px-4">
              <Search className="h-5 w-5 shrink-0 text-blue-500" aria-hidden />
              <label htmlFor="home-search" className="sr-only">
                Search schools
              </label>
              <input
                id="home-search"
                name="search"
                type="search"
                placeholder="Search schools by name, city, board or locality..."
                className="h-14 w-full bg-transparent font-body text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>

            <button
              type="submit"
              className="group flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-heading text-sm font-semibold text-white transition-all hover:from-blue-700 hover:to-blue-800 focus:outline-none sm:min-h-14"
            >
              Search
              <Search className="h-4 w-4 transition-transform group-hover:scale-110" />
            </button>
          </form>

          <div className="relative mt-5 flex flex-wrap items-center justify-center gap-2">
            {QUICK_SEARCHES.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-blue-200/70 bg-blue-50/60 px-3.5 py-1.5 font-heading text-xs font-semibold text-blue-800 transition-all hover:border-blue-500 hover:bg-blue-600 hover:text-white hover:shadow-md"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* trust strip - bridges into next section */}
          <div className="relative mt-6 flex items-center justify-center gap-6 border-t border-gray-100 pt-5 text-xs text-gray-400 sm:gap-10">
            <div className="flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-blue-400" />
              <span className="font-body">500+ Schools</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-blue-400" />
              <span className="font-body">20+ Cities</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-blue-400" />
              <span className="font-body">All Boards</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
