import type { InquiryStatus } from "@/lib/types/database";
import { Badge } from "@/components/shared/ui/badge";

 const STATUS_VARIANT: Record<InquiryStatus, "default" | "warning" | "secondary" | "success"> = {
   NEW: "default",
   CONTACTED: "warning",
   INTERESTED: "warning",
   CONVERTED: "success",
   CLOSED: "secondary",
};

const STATUS_LABEL: Record<InquiryStatus, string> = {
   NEW: "New",
   CONTACTED: "Contacted",
   INTERESTED: "Interested",
   CONVERTED: "Converted",
   CLOSED: "Closed",
};

export default function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
  );
}
