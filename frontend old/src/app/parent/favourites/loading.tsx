export default function FavouritesLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 space-y-3">
        <div className="h-10 w-56 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-5 w-72 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-72 rounded-2xl border border-gray-100 bg-white animate-pulse"
          />
        ))}
      </div>
    </main>
  );
}
