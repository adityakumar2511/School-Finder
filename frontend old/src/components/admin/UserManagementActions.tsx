"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/types/database";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ROLES: Role[] = ["PARENT", "SCHOOL_ADMIN", "ADMIN"];

type Props = {
  userId: string;
  currentRole: Role;
  accountStatus: "active" | "disabled";
  isSelf: boolean;
};

export default function UserManagementActions({
  userId,
  currentRole,
  accountStatus,
  isSelf,
}: Props) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState<string | null>(null);
  const [disableOpen, setDisableOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <Select
        value={role}
        onValueChange={(v) => updateRole(v as Role)}
        disabled={isSelf || loading !== null}
      >
        <SelectTrigger className="h-9 w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => (
            <SelectItem key={r} value={r}>
              {r.replace("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!isSelf && (
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
