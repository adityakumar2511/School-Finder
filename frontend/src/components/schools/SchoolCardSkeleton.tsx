export default function SchoolCardSkeleton() {
  return (
    <div
      className="rounded-2xl border border-gray-100 bg-white p-5 overflow-hidden"
      aria-hidden
    >
      <div className="h-1 w-full shimmer mb-5 rounded-full" />
      <div className="mb-4 flex gap-4">
        <div className="h-14 w-14 shrink-0 rounded-xl shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded-lg shimmer" />
          <div className="h-3 w-1/2 rounded-lg shimmer" />
        </div>
      </div>
      <div className="mb-4 flex gap-2">
        <div className="h-6 w-16 rounded-full shimmer" />
        <div className="h-6 w-14 rounded-full shimmer" />
      </div>
      <div className="h-3 w-2/3 rounded-lg shimmer" />
    </div>
  );
}
