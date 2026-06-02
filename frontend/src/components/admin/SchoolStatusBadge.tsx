import type { SchoolStatus } from "@/lib/types/database";
import { Badge } from "@/components/ui/badge";

const VARIANT: Record<SchoolStatus, "warning" | "success" | "danger"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

export default function SchoolStatusBadge({ status }: { status: SchoolStatus }) {
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return <Badge variant={VARIANT[status]}>{label}</Badge>;
}
