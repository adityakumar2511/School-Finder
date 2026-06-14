import SchoolGridSkeleton from "@/components/public/schools/SchoolGridSkeleton";

export default function FeaturedSchoolsSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8 space-y-2 animate-pulse">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-4 w-64 rounded bg-gray-100" />
      </div>
      <SchoolGridSkeleton count={6} />
    </section>
  );
}
