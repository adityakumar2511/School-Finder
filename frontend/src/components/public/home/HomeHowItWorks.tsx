import { HOW_IT_WORKS_STEPS } from "@/components/public/home/home-data";

export default function HomeHowItWorks() {
  return (
    <section
      className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="font-heading text-sm font-semibold uppercase tracking-wide text-amber-600">
            How It Works
          </p>
          <h2
            id="how-it-works-heading"
            className="mt-2 font-heading text-3xl font-bold text-blue-800"
          >
            A Simple Journey from Search to Admission
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-5">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <div key={step.title} className="relative">
              <div className="card-premium h-full text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                  <step.icon className="h-6 w-6 text-blue-600" aria-hidden />
                </div>

                <div className="mx-auto mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 font-heading text-sm font-bold text-amber-800">
                  {index + 1}
                </div>

                <h3 className="font-heading text-lg font-semibold text-blue-800">
                  {step.title}
                </h3>
                <p className="mt-2 font-body text-sm text-gray-500">
                  {step.description}
                </p>
              </div>

              {index < HOW_IT_WORKS_STEPS.length - 1 ? (
                <div
                  className="absolute -right-5 top-1/2 z-10 hidden -translate-y-1/2 md:block"
                  aria-hidden
                >
                  <svg
                    width="40"
                    height="24"
                    viewBox="0 0 40 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient
                        id={`arrowGradient-${index}`}
                        x1="0"
                        y1="0"
                        x2="40"
                        y2="0"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0%" stopColor="#93C5FD" />
                        <stop offset="100%" stopColor="#FBBF24" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M2 12C10 12 12 6 20 6C28 6 30 12 38 12"
                      stroke={`url(#arrowGradient-${index})`}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="4 4"
                    />
                    <path
                      d="M33 7L38 12L33 17"
                      stroke="#FBBF24"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}