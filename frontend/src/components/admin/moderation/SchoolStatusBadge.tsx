import type { SchoolStatus } from "@/lib/types/database";
import { Badge } from "@/components/shared/ui/badge";
import { EyeOff } from "lucide-react";

const VARIANT: Record<SchoolStatus, "warning" | "success" | "danger"> = {
  DRAFT: "warning",
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

type Props = {
  status: SchoolStatus;
  isVisible?: boolean; // §4 — when explicitly false, shows a distinct "Hidden" badge alongside status
};

export default function SchoolStatusBadge({ status, isVisible }: Props) {
  const label = status.charAt(0) + status.slice(1).toLowerCase();

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Badge variant={VARIANT[status]}>{label}</Badge>
      {isVisible === false && (
        <Badge variant="warning" className="gap-1">
          <EyeOff className="h-3 w-3" />
          Hidden
        </Badge>
      )}
    </div>
  );
}