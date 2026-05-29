import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
};

function buildHref(
  basePath: string,
  page: number,
  searchParams: Record<string, string | undefined>
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export default function AdminPagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: Props) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 && (
        <Link
          href={buildHref(basePath, page - 1, searchParams)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-heading font-semibold text-gray-600 hover:bg-gray-50"
        >
          Previous
        </Link>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
        .map((p) => (
          <Link
            key={p}
            href={buildHref(basePath, p, searchParams)}
            className={cn(
              "min-w-[2.25rem] rounded-lg px-3 py-2 text-center text-sm font-heading font-semibold",
              p === page
                ? "bg-blue-600 text-white"
                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            {p}
          </Link>
        ))}
      {page < totalPages && (
        <Link
          href={buildHref(basePath, page + 1, searchParams)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-heading font-semibold text-gray-600 hover:bg-gray-50"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
