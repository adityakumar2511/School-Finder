import {
  PARENT_TESTIMONIALS,
  SCHOOL_TESTIMONIALS,
} from "@/components/public/home/home-data";

export default function HomeTestimonials() {
  return (
    <section
      className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8"
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="font-heading text-sm font-semibold uppercase tracking-wide text-amber-600">
            Real Experiences
          </p>
          <h2
            id="testimonials-heading"
            className="mt-2 font-heading text-3xl font-bold text-blue-800"
          >
            What Parents and Schools Are Saying
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 font-heading text-xl font-semibold text-blue-800">
              What Parents Are Saying
            </h3>
            <div className="space-y-4">
              {PARENT_TESTIMONIALS.map((item) => (
                <blockquote key={item.quote} className="card-premium bg-white">
                  <p className="font-body text-gray-600">“{item.quote}”</p>
                  <footer className="mt-4 font-heading text-sm font-semibold text-blue-800">
                    — {item.name}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-heading text-xl font-semibold text-blue-800">
              What Schools Are Saying
            </h3>
            <div className="space-y-4">
              {SCHOOL_TESTIMONIALS.map((item) => (
                <blockquote key={item.quote} className="card-premium bg-white">
                  <p className="font-body text-gray-600">“{item.quote}”</p>
                  <footer className="mt-4 font-heading text-sm font-semibold text-blue-800">
                    — {item.name}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}