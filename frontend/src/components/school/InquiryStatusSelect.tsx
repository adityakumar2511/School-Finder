"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { InquiryStatus } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUSES: InquiryStatus[] = ["NEW", "CONTACTED", "CLOSED"];

type Props = {
  inquiryId: string;
  currentStatus: InquiryStatus;
};

export default function InquiryStatusSelect({ inquiryId, currentStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(next: InquiryStatus) {
    setSaving(true);
    setError(null);
    setStatus(next);

    try {
      const res = await fetch(`/api/school/inquiries/${inquiryId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus(currentStatus);
        setError(body.message ?? "Failed to update status");
        return;
      }

      router.refresh();
    } catch {
      setStatus(currentStatus);
      setError("Unable to update status. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-1">
      <Select
        value={status}
        onValueChange={(value) => onChange(value as InquiryStatus)}
        disabled={saving}
      >
        <SelectTrigger className="h-9 w-[140px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((item) => (
            <SelectItem key={item} value={item}>
              {item.charAt(0) + item.slice(1).toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-danger-text">{error}</p>}
    </div>
  );
}
