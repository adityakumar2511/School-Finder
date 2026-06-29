import { BookOpen } from "lucide-react";
import { BLOG_PREVIEW_ITEMS } from "@/components/public/home/home-data";

export default function HomeBlogPreview() {
  return (
    <section
      className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8"
      aria-labelledby="blog-preview-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="font-heading text-sm font-semibold uppercase tracking-wide text-amber-600">
              Latest from Our Blog
            </p>

            <h2
              id="blog-preview-heading"
              className="mt-2 font-heading text-3xl font-bold text-blue-800"
            >
              Helpful Resources for Parents and Schools
            </h2>

            <p className="mt-4 font-body text-gray-500">
              Stay updated with articles covering school admissions, education,
              parenting, and school growth.
            </p>

            <p className="mt-6 inline-flex rounded-full bg-blue-50 px-4 py-2 font-heading text-xs font-semibold text-blue-800">
              Blog section coming soon
            </p>
          </div>

          <div className="card-premium bg-white">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <BookOpen className="h-5 w-5 text-blue-600" aria-hidden />
              </div>

              <h3 className="font-heading text-xl font-semibold text-blue-800">
                Popular Reads
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {BLOG_PREVIEW_ITEMS.map((item) => (
                <article
                  key={item}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:bg-blue-50"
                >
                  <p className="font-body text-sm font-medium text-gray-700">
                    {item}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}