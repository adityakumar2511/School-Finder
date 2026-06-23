import type { SchoolStatus } from "@/lib/types/database";
import { Badge } from "@/components/shared/ui/badge";
import { EyeOff, Star } from "lucide-react";

const VARIANT: Record<SchoolStatus, "warning" | "success" | "danger"> = {
  DRAFT: "warning",
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

type Props = {
  status: SchoolStatus;
  isVisible?: boolean;
  isFeatured?: boolean;
  featuredUntil?: string | null;
};

export default function SchoolStatusBadge({ status, isVisible, isFeatured, featuredUntil }: Props) {
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  const featuredActive = isFeatured && (!featuredUntil || new Date(featuredUntil) > new Date());

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Badge variant={VARIANT[status]}>{label}</Badge>
      {isVisible === false && (
        <Badge variant="warning" className="gap-1">
          <EyeOff className="h-3 w-3" />
          Hidden
        </Badge>
      )}
      {featuredActive && (
        <Badge variant="warning" className="gap-1 border-amber-300 bg-amber-50 text-amber-700">
          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
          Featured
        </Badge>
      )}
    </div>
  );
}