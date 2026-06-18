import type { AdminAccessLevel } from "@/lib/types/database";

type Config = {
  label: string;
  className: string;
};

const CONFIG: { [key in AdminAccessLevel]: Config } = {
  READ_ONLY: {
    label: "Read Only",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  READ_WRITE: {
    label: "Read + Write",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  FULL_ACCESS: {
    label: "Full Access",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

export default function AdminAccessBadge({
  level,
  isSuperAdmin = false,
}: {
  level: AdminAccessLevel | null | undefined;
  isSuperAdmin?: boolean;
}) {
  // Super admin check pehle
  if (isSuperAdmin) {
    return (
      <span className="inline-flex items-center rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
        Super Admin
      </span>
    );
  }
  if (!level) {
    return (
      <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-400">
        —
      </span>
    );
  }

  const { label, className } = CONFIG[level];

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}