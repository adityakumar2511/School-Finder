import Link from "next/link";
import { GraduationCap, Mail, MapPin } from "lucide-react";

const FOOTER_LINKS = [
  { href: "/schools", label: "Browse schools" },
  { href: "/school-register", label: "List your school" },
  { href: "/login", label: "Parent login" },
];

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-blue-200 border-t border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-400 shadow-amber">
                <GraduationCap className="w-5 h-5 text-white" aria-hidden />
              </span>
              <span className="font-heading font-bold text-xl text-white tracking-tight">
                SchoolFinder
              </span>
            </div>
            <p className="text-sm text-blue-200/90 leading-relaxed max-w-xs">
              A modern school discovery platform helping families across India
              find and compare the right school.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <p className="font-heading font-semibold text-white text-sm mb-4">
              Explore
            </p>
            <ul className="space-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-blue-200 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="font-heading font-semibold text-white text-sm mb-4">
              Contact
            </p>
            <ul className="space-y-3 text-sm font-body text-blue-200/90">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" aria-hidden />
                support@schoolfinder.in
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden />
                Serving schools and families across India
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-blue-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-blue-300/80">
            &copy; {new Date().getFullYear()} SchoolFinder. All rights reserved.
          </p>
          <p className="text-xs text-blue-300/60">
            Built for production — secure, fast, and accessible.
          </p>
        </div>
      </div>
    </footer>
  );
}
