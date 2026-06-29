import { HOME_STATS } from "@/components/public/home/home-data";

export default function HomeStats() {
  return (
    <section
      className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8"
      aria-labelledby="home-stats-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="font-heading text-sm font-semibold uppercase tracking-wide text-amber-600">
            Trusted by Growing Communities
          </p>
          <h2
            id="home-stats-heading"
            className="mt-2 font-heading text-3xl font-bold text-blue-800"
          >
            Helping Schools and Parents Connect
          </h2>
          <p className="mt-3 font-body text-gray-500">
            Lakshya One is building a better way for schools and parents to
            discover each other through one trusted platform.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HOME_STATS.map((item) => (
            <div key={item.label} className="card-premium text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                <item.icon className="h-6 w-6 text-blue-600" aria-hidden />
              </div>
              <p className="font-heading text-3xl font-bold text-blue-800 tabular-nums">
                {item.stat}
              </p>
              <p className="mt-2 font-body text-sm text-gray-500">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}