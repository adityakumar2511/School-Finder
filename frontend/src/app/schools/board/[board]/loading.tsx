import SchoolGridSkeleton from "@/components/public/schools/SchoolGridSkeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-blue-800 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-4 w-32 bg-blue-700 rounded mb-3 animate-pulse" />
          <div className="h-9 w-64 bg-blue-700 rounded mb-2 animate-pulse" />
          <div className="h-4 w-80 bg-blue-700 rounded animate-pulse" />
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <SchoolGridSkeleton count={12} />
      </div>
    </main>
  );
}