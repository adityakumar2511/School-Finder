import SchoolGridSkeleton from "@/components/public/schools/SchoolGridSkeleton";

export default function SchoolsLoading() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-blue-800 py-10 px-4 animate-pulse">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="h-9 w-48 rounded bg-blue-700" />
          <div className="h-5 w-72 rounded bg-blue-700/60" />
          <div className="mt-5 h-11 max-w-lg rounded-xl bg-blue-700/40" />
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div
            className="w-full lg:w-64 h-64 rounded-2xl bg-white border border-gray-100 animate-pulse"
            aria-hidden
          />
          <div className="flex-1">
            <SchoolGridSkeleton count={12} />
          </div>
        </div>
      </div>
    </main>
  );
}
