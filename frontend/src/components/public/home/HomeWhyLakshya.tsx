import { CheckCircle2 } from "lucide-react";
import { WHY_LAKSHYA_POINTS } from "@/components/public/home/home-data";

export default function HomeWhyLakshya() {
  return (
    <section
      className="bg-white px-4 py-16 sm:px-6 lg:px-8"
      aria-labelledby="why-lakshya-heading"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="font-heading text-sm font-semibold uppercase tracking-wide text-amber-600">
            Why Lakshya One
          </p>
          <h2
            id="why-lakshya-heading"
            className="mt-2 font-heading text-3xl font-bold text-blue-800"
          >
            Making School Discovery Simple for Every Family
          </h2>

          <div className="mt-5 space-y-4 font-body text-gray-500">
            <p>
              Finding the right school often means visiting multiple campuses,
              collecting brochures, making phone calls, and comparing
              information from different places.
            </p>
            <p>
              Lakshya One simplifies this process by bringing school information
              together into one organized platform.
            </p>
            <p>
              For schools, it provides an opportunity to establish a stronger
              online presence and become easier for parents to discover.
            </p>
            <p className="font-heading font-semibold text-blue-800">
              Because choosing a school should be based on better
              information—not guesswork.
            </p>
          </div>
        </div>

        <div className="card-premium">
          <h3 className="font-heading text-2xl font-semibold text-blue-800">
            Why Choose Lakshya One?
          </h3>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {WHY_LAKSHYA_POINTS.map((point) => (
              <div
                key={point}
                className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4"
              >
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-success-text"
                  aria-hidden
                />
                <p className="font-body text-sm font-medium text-gray-700">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}