export default function SchoolCardSkeleton() {
  return (
    <div
      className="rounded-2xl border border-gray-100 bg-white overflow-hidden animate-pulse"
      aria-hidden
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />

      <div className="p-5">
        <div className="mb-4 flex items-start gap-4">
          <div className="h-16 w-16 shrink-0 rounded-2xl bg-gray-200" />
          <div className="min-w-0 flex-1 space-y-2 pt-1">
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-3 w-1/2 rounded bg-gray-200" />
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <div className="h-6 w-16 rounded-full bg-gray-200" />
          <div className="h-6 w-14 rounded-full bg-gray-200" />
          <div className="h-6 w-20 rounded-full bg-gray-200" />
        </div>

        <div className="border-t border-gray-100 pt-4 flex items-end justify-between gap-3">
          <div className="space-y-2">
            <div className="h-3 w-12 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
          </div>
          <div className="space-y-2 text-right">
            <div className="h-3 w-10 rounded bg-gray-200 ml-auto" />
            <div className="h-5 w-20 rounded bg-gray-200 ml-auto" />
          </div>
        </div>

        <div className="mt-4 border-t border-gray-50 pt-3 flex items-center justify-between">
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-8 w-8 rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
