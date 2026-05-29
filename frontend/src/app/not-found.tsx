import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-16 text-center font-body text-gray-900">
      <p className="font-heading text-display-lg font-bold text-blue-800">404</p>
      <h1 className="mt-4 font-heading text-h2 font-bold text-gray-900">Page Not Found</h1>
      <p className="mt-3 max-w-md text-body-lg text-gray-600">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-primary">
          Go Home
        </Link>
        <Link href="/schools" className="btn-secondary">
          Browse Schools
        </Link>
      </div>
    </div>
  );
}
