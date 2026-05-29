"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ApproveRejectButtonsProps {
  schoolId: string;
  currentStatus: string;
}

export default function ApproveRejectButtons({
  schoolId,
  currentStatus,
}: ApproveRejectButtonsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading("approve");
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schoolId }),
        }
      );
      if (!res.ok) throw new Error("Approve failed");
      router.refresh();
    } catch {
      setError("Could not approve the school. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) return;
    setLoading("reject");
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schoolId, reason: rejectReason }),
        }
      );
      if (!res.ok) throw new Error("Reject failed");
      setShowRejectModal(false);
      setRejectReason("");
      router.refresh();
    } catch {
      setError("Could not reject the school. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  if (currentStatus === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-success-text/20 bg-success-bg px-2 py-1 text-xs font-medium text-success-text">
        <CheckCircle className="w-3 h-3" />
        Approved
      </span>
    );
  }

  if (currentStatus === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-danger-text/20 bg-danger-bg px-2 py-1 text-xs font-medium text-danger-text">
        <XCircle className="w-3 h-3" />
        Rejected
      </span>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleApprove}
          disabled={loading !== null}
          className="h-8"
        >
          {loading === "approve" ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <CheckCircle className="w-3 h-3" />
          )}
          Approve
        </Button>

        <Button
          size="sm"
          variant="destructive"
          onClick={() => setShowRejectModal(true)}
          disabled={loading !== null}
          className="h-8"
        >
          <XCircle className="w-3 h-3" />
          Reject
        </Button>
      </div>

      {error && (
        <p className="mt-1 font-body text-xs text-danger-text">{error}</p>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-card-hover">
            <h3 className="mb-1 font-heading text-lg font-bold text-blue-900">
              Reject school
            </h3>
            <p className="mb-4 font-body text-sm text-gray-400">
              Provide a rejection reason. The school owner will see it on their dashboard.
            </p>

            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. incomplete information, invalid address"
              rows={4}
            />

            {error && (
              <p className="mt-2 font-body text-xs text-danger-text">{error}</p>
            )}

            <div className="mt-4 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setError(null);
                }}
                disabled={loading === "reject"}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleRejectSubmit}
                disabled={!rejectReason.trim() || loading === "reject"}
              >
                {loading === "reject" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Confirm reject
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
