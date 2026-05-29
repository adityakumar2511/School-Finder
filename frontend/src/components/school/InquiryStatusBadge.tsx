import type { InquiryStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<
  InquiryStatus,
  "default" | "warning" | "secondary"
> = {
  NEW: "default",
  CONTACTED: "warning",
  CLOSED: "secondary",
};

const STATUS_LABEL: Record<InquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  CLOSED: "Closed",
};

export default function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
  );
}
