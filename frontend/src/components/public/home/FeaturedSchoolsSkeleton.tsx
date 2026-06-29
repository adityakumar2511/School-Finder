import SchoolGridSkeleton from "@/components/public/schools/SchoolGridSkeleton";

export default function FeaturedSchoolsSkeleton() {
  return (
    <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 space-y-3 animate-pulse">
          <div className="h-4 w-36 rounded bg-amber-100" />
          <div className="h-8 w-64 rounded bg-gray-200" />
          <div className="h-4 w-full max-w-xl rounded bg-gray-100" />
        </div>

        <SchoolGridSkeleton count={6} />
      </div>
    </section>
  );
}