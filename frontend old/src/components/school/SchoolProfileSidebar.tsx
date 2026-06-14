"use client";

import type { SidebarSection } from "./formSections/types";

interface Props {
  sections:    SidebarSection[];
  activeIndex: number;
  onSelect:    (index: number) => void;
}

export function SchoolProfileSidebar({ sections, activeIndex, onSelect }: Props) {
  return (
    <>
      {/* ── Desktop sidebar — sticky left ─────────────────── */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0">
        <nav className="sticky top-6 space-y-1">
          {sections.map(({ index, label }) => (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(index)}
              className={`w-full text-left px-3 py-2.5 rounded-xl font-heading text-sm transition-colors ${
                activeIndex === index
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              <span className="mr-2 opacity-50 text-xs">
                {String(index + 1).padStart(2, "0")}
              </span>
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Mobile — horizontal scroll tabs ───────────────── */}
      <div className="lg:hidden w-full overflow-x-auto pb-1 mb-4">
        <div className="flex gap-2 min-w-max px-1">
          {sections.map(({ index, label }) => (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(index)}
              className={`px-3 py-1.5 rounded-xl font-heading text-sm whitespace-nowrap transition-colors ${
                activeIndex === index
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default SchoolProfileSidebar;