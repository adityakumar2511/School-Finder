import Link from "next/link";
import { Search } from "lucide-react";

const QUICK_SEARCHES = [
  { label: "CBSE", href: "/schools?board=CBSE" },
  { label: "ICSE", href: "/schools?board=ICSE" },
  { label: "State Board", href: "/schools?board=STATE_BOARD" },
  { label: "Prayagraj", href: "/schools?city=Prayagraj" },
];

export default function HomeSearch() {
  return (
    <section
      className="relative z-10 -mt-8 px-4 sm:px-6 lg:px-8"
      aria-labelledby="home-search-heading"
    >
      <div className="mx-auto max-w-5xl rounded-3xl border border-gray-100 bg-white p-5 shadow-card-hover sm:p-6">
        <div className="mb-4 text-center">
          <h2
            id="home-search-heading"
            className="font-heading text-2xl font-bold text-blue-800"
          >
            Search Schools
          </h2>
          <p className="mt-1 font-body text-sm text-gray-500">
            Search schools by name, city, board or locality.
          </p>
        </div>

        <form
          action="/schools"
          method="GET"
          role="search"
          aria-label="Search schools"
          className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-600 sm:flex-row"
        >
          <div className="flex flex-1 items-center gap-3 px-4">
            <Search className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
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
            className="bg-blue-600 px-4 py-2.5 font-heading text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:min-h-14"
          >
            Search
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {QUICK_SEARCHES.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 font-heading text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-200/40"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}