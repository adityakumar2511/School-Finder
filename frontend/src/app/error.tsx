"use client";

import Link from "next/link";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ reset }: ErrorPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-16 text-center font-body text-gray-900">
      <h1 className="font-heading text-h2 font-bold text-gray-900">Something went wrong</h1>
      <p className="mt-3 max-w-md text-body-lg text-gray-600">
        An unexpected error occurred. Please try again.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={() => reset()} className="btn-primary">
          Try Again
        </button>
        <Link href="/" className="btn-secondary">
          Go Home
        </Link>
      </div>
    </div>
  );
}
