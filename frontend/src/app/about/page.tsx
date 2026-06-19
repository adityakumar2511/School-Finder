import type { Metadata } from "next";
import { GraduationCap, Target, Heart, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | SchoolFinder",
  description:
    "Learn about SchoolFinder's mission to help parents in Tier-2 and Tier-3 Indian cities find the right school for their children.",
};

const values = [
  {
    icon: <Target className="w-6 h-6 text-blue-600" />,
    title: "Our Mission",
    description:
      "To make quality school discovery accessible to every parent across India — starting with the cities that need it most.",
  },
  {
    icon: <Heart className="w-6 h-6 text-blue-600" />,
    title: "Why We Built This",
    description:
      "Finding the right school in a Tier-2 or Tier-3 city meant asking around, making calls, and visiting schools blindly. We set out to change that.",
  },
  {
    icon: <Users className="w-6 h-6 text-blue-600" />,
    title: "Who We Serve",
    description:
      "Parents looking for the best fit for their child, and schools who deserve to be discovered — regardless of how big their marketing budget is.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-blue-800 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400 mb-6">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">About SchoolFinder</h1>
          <p className="text-lg text-blue-200 leading-relaxed">
            We're building India's most trusted school discovery platform — one city at a time.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Story</h2>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            SchoolFinder started with a simple observation: parents in smaller Indian cities had
            almost no reliable way to research schools online. Big metro cities had review
            platforms and aggregators, but Tier-2 and Tier-3 cities were largely invisible.
          </p>
          <p>
            We decided to build a platform that puts detailed school information — fees,
            facilities, board affiliations, gallery, and more — in one place, and makes it
            easy for parents to send inquiries directly to schools they're interested in.
          </p>
          <p>
            SchoolFinder is designed to be the bridge between parents who are making one of the
            most important decisions of their family's life, and the schools that are working hard
            to serve their communities.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white border-t border-gray-100 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">What Drives Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v) => (
              <div key={v.title} className="card-premium">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  {v.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}