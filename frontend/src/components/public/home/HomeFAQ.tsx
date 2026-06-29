import { HOME_FAQS } from "@/components/public/home/home-data";

export default function HomeFAQ() {
  return (
    <section
      className="bg-white px-4 py-16 sm:px-6 lg:px-8"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <p className="font-heading text-sm font-semibold uppercase tracking-wide text-amber-600">
            Frequently Asked Questions
          </p>
          <h2
            id="faq-heading"
            className="mt-2 font-heading text-3xl font-bold text-blue-800"
          >
            Common Questions About Lakshya One
          </h2>
        </div>

        <div className="space-y-4">
          {HOME_FAQS.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-gray-100 bg-gray-50 p-5"
            >
              <summary className="cursor-pointer list-none font-heading text-base font-semibold text-blue-800">
                <span className="flex items-center justify-between gap-4">
                  {item.question}
                  <span className="text-blue-600 transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 font-body text-sm leading-relaxed text-gray-500">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}