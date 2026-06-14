import type { Role } from "@/lib/types/database";
import { Badge } from "@/components/shared/ui/badge";

const VARIANT: Record<Role, "default" | "secondary" | "outline"> = {
  PARENT: "secondary",
  SCHOOL_ADMIN: "default",
  ADMIN: "outline",
};

export default function RoleBadge({ role }: { role: Role }) {
  return <Badge variant={VARIANT[role]}>{role.replace("_", " ")}</Badge>;
}
