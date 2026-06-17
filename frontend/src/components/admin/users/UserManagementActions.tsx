"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role, AdminAccessLevel } from "@/lib/types/database";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog";

type Props = {
  userId: string;
  currentRole: Role;
  accountStatus: "active" | "disabled";
  isSelf: boolean;
  viewerAccessLevel: AdminAccessLevel | null; // ADD — viewer ka access level
};

function getAllowedRoles(currentRole: Role): Role[] {
  if (currentRole === "PARENT") return ["PARENT", "SCHOOL_ADMIN"];
  if (currentRole === "SCHOOL_ADMIN") return ["SCHOOL_ADMIN"];
  return [currentRole];
}

function RoleBadgeFallback({ role }: { role: Role }) {
  return (
    <span className="inline-flex h-9 items-center rounded-md border border-gray-200 bg-gray-50 px-3 font-body text-sm text-gray-600">
      {role.replace("_", " ")}
    </span>
  );
}

export default function UserManagementActions({
  userId,
  currentRole,
  accountStatus,
  isSelf,
  viewerAccessLevel,
}: Props) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState<string | null>(null);
  const [disableOpen, setDisableOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allowedRoles = getAllowedRoles(currentRole);
  const canChangeRole = allowedRoles.length > 1 && !isSelf && viewerAccessLevel === "FULL_ACCESS";
  const canToggleStatus = !isSelf && viewerAccessLevel === "FULL_ACCESS";

  async function updateRole(next: Role) {
    setLoading("role");
    setError(null);
    setRole(next);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRole(currentRole);
        throw new Error(body.message ?? "Failed to update role");
      }
      router.refresh();
    } catch (err) {
      setRole(currentRole);
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setLoading(null);
    }
  }

  async function toggleStatus() {
    const next = accountStatus === "active" ? "disabled" : "active";
    setLoading("status");
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message ?? "Failed to update status");
      setDisableOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      {canChangeRole ? (
        <Select
          value={role}
          onValueChange={(v) => updateRole(v as Role)}
          disabled={loading !== null}
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {allowedRoles.map((r) => (
              <SelectItem key={r} value={r}>
                {r.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <RoleBadgeFallback role={currentRole} />
      )}

      {/* Consolidated status toggle — FULL_ACCESS only, not self */}
      {canToggleStatus && (
        <Button
          size="sm"
          variant="outline"
          className="h-9"
          disabled={loading !== null}
          onClick={() =>
            accountStatus === "active" ? setDisableOpen(true) : toggleStatus()
          }
        >
          {loading === "status" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : accountStatus === "active" ? (
            "Disable"
          ) : (
            "Enable"
          )}
        </Button>
      )}

      {error && <p className="text-xs text-danger-text">{error}</p>}

      <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable account?</DialogTitle>
            <DialogDescription>
              This user will not be able to sign in until the account is re-enabled.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={loading === "status"}
              onClick={toggleStatus}
            >
              Confirm disable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}