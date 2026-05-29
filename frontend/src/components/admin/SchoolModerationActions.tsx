"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  schoolId: string;
  currentStatus: string;
};

export default function SchoolModerationActions({
  schoolId,
  currentStatus,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function approve() {
    setLoading("approve");
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/schools/${schoolId}/approve`, {
        method: "PATCH",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message ?? "Approval failed");
      setSuccess("School approved");
      setConfirmApproveOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approval failed");
    } finally {
      setLoading(null);
    }
  }

  async function reject() {
    if (!reason.trim()) return;
    setLoading("reject");
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/schools/${schoolId}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message ?? "Rejection failed");
      setSuccess("School rejected");
      setRejectOpen(false);
      setReason("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rejection failed");
    } finally {
      setLoading(null);
    }
  }

  if (currentStatus === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-success-text/20 bg-success-bg px-2 py-1 text-xs font-medium text-success-text">
        <CheckCircle className="h-3 w-3" />
        Approved
      </span>
    );
  }

  if (currentStatus === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-danger-text/20 bg-danger-bg px-2 py-1 text-xs font-medium text-danger-text">
        <XCircle className="h-3 w-3" />
        Rejected
      </span>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          className="h-8"
          disabled={loading !== null}
          onClick={() => setConfirmApproveOpen(true)}
        >
          Approve
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="h-8"
          disabled={loading !== null}
          onClick={() => setRejectOpen(true)}
        >
          Reject
        </Button>
      </div>
      {success && <p className="text-xs text-success-text">{success}</p>}
      {error && <p className="text-xs text-danger-text">{error}</p>}

      <Dialog open={confirmApproveOpen} onOpenChange={setConfirmApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve school?</DialogTitle>
            <DialogDescription>
              This school will be published on SchoolFinder for parents to discover.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmApproveOpen(false)}>
              Cancel
            </Button>
            <Button disabled={loading === "approve"} onClick={approve}>
              {loading === "approve" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirm approve"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject school</DialogTitle>
            <DialogDescription>
              Provide a reason. The school owner will see this on their dashboard.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection…"
            rows={4}
          />
          {error && <p className="text-sm text-danger-text">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!reason.trim() || loading === "reject"}
              onClick={reject}
            >
              {loading === "reject" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirm reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
