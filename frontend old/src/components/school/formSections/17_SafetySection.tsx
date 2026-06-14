"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { SectionProps } from "./types";

// ─────────────────────────────────────────────────────────────
// Toggle Row
// ─────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
      <div>
        <p className="font-heading text-label text-gray-800">{label}</p>
        {description && (
          <p className="font-body text-meta text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          checked ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Safety feature config
// ─────────────────────────────────────────────────────────────

type SafetyKey = "cctv" | "guards" | "medicalRoom" | "fireSafety" | "visitorManagement";

const SAFETY_FEATURES: {
  key: SafetyKey;
  label: string;
  description: string;
}[] = [
  {
    key: "cctv",
    label: "CCTV Surveillance",
    description: "Camera coverage across campus, corridors, and entry points",
  },
  {
    key: "guards",
    label: "Security Guards",
    description: "Trained security personnel on duty during school hours",
  },
  {
    key: "medicalRoom",
    label: "Medical Room / First Aid",
    description: "Dedicated medical room with first aid and a nurse / doctor",
  },
  {
    key: "fireSafety",
    label: "Fire Safety Equipment",
    description: "Fire extinguishers, alarms, and emergency evacuation plans",
  },
  {
    key: "visitorManagement",
    label: "Visitor Management System",
    description: "Controlled entry with ID verification for all visitors",
  },
];

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function SafetySection({ watch, setValue }: SectionProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">Safety & Security</h2>
        <p className="font-body text-body text-gray-400 mt-1">
          Safety measures and security infrastructure at your school
        </p>
      </div>

      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-3">
          {SAFETY_FEATURES.map(({ key, label, description }) => (
            <ToggleRow
              key={key}
              label={label}
              description={description}
              checked={watch(`safety.${key}`) ?? false}
              onChange={(val) => setValue(`safety.${key}`, val)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Info note */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
        <p className="font-body text-sm text-blue-600">
          🛡️ Safety information is a top factor for parents choosing a school. Enable all features that apply to your campus.
        </p>
      </div>
    </div>
  );
}