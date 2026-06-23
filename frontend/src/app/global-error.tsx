"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <main className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
          <div className="max-w-md rounded-2xl bg-white p-8 shadow-card text-center">
            <h1 className="font-heading text-2xl font-bold text-gray-900">
              Something went wrong
            </h1>

            <p className="mt-3 font-body text-gray-600">
              Please try again. If the issue continues, our team will check it.
            </p>

            <button
              onClick={reset}
              className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}