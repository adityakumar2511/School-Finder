export default function SchoolDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse" aria-busy aria-label="Loading school profile">
      <div className="bg-blue-800 h-48" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-40 rounded-2xl bg-white border border-gray-100" />
          <div className="h-56 rounded-2xl bg-white border border-gray-100" />
          <div className="h-48 rounded-2xl bg-white border border-gray-100" />
        </div>
        <div className="h-72 rounded-2xl bg-white border border-gray-100" />
      </div>
    </div>
  );
}
