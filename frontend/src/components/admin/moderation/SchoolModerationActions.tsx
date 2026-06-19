"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/shared/ui/dialog";
import type { SchoolStatus, AdminAccessLevel } from "@/lib/types/database";
import SchoolDetailModal from "./SchoolDetailModal";

type SchoolDetail = {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  address: string;
  board: string;
  schoolType: string;
  medium: string;
  classesFrom: number;
  classesTo: number;
  phone: string;
  email: string | null;
  website: string | null;
  description: string | null;
  status: SchoolStatus;
  isVisible: boolean;          // ← naya — §4
  rejectionReason: string | null;
  totalStudents: number | null;
  establishedYear: number | null;
  admissionFee: number | null;
  tuitionFeeMonthly: number | null;
  totalAnnualFee: number | null;
  transportFee: number | null;
  hostelFee: number | null;
  logoUrl: string | null;
  owner: { name: string | null; email: string };
  createdAt: string;
};

type Props = {
  school: SchoolDetail;
  currentStatus: SchoolStatus;
  viewerAccessLevel: AdminAccessLevel | null;
};

export default function SchoolModerationActions({
  school,
  currentStatus,
  viewerAccessLevel,
}: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState<
  "approve" | "reject" | "delete" | "visibility" | null
>(null);
  const [isVisible, setIsVisible] = useState(school.isVisible);

  const canWrite =
    viewerAccessLevel === "READ_WRITE" || viewerAccessLevel === "FULL_ACCESS";
  const canDelete = viewerAccessLevel === "FULL_ACCESS";

  async function handleApprove(id: string) {
    setLoading("approve");
    try {
      await fetch(`/api/admin/schools/${id}/approve`, { method: "PATCH" });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleReject(id: string, reason: string) {
    setLoading("reject");
    try {
      await fetch(`/api/admin/schools/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete(id: string) {
    setLoading("delete");
    try {
      await fetch(`/api/admin/schools/${id}`, { method: "DELETE" });
      setDeleteOpen(false);
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  // §4 — toggle public listing visibility, independent of approve/reject status
  async function handleToggleVisibility() {
    const next = !isVisible;
    setLoading("visibility");
    setIsVisible(next); // optimistic
    try {
      const res = await fetch(`/api/admin/schools/${school.id}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: next }),
      });
      if (!res.ok) {
        setIsVisible(!next); // revert on failure
      } else {
        router.refresh();
      }
    } catch {
      setIsVisible(!next);
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {/* View detail modal — always visible */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setModalOpen(true)}
          className="h-8 px-3 font-heading text-xs rounded-lg border-gray-200"
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          View
        </Button>

        {/* Edit school — READ_WRITE+ */}
        {canWrite && (
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-8 px-3 font-heading text-xs rounded-lg border-gray-200"
          >
            <Link href={`/admin/schools/${school.id}/edit`}>
              <Pencil className="h-3.5 w-3.5 mr-1" />
              Edit
            </Link>
          </Button>
        )}

        {/* View inquiries for this school — always visible */}
        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-8 px-3 font-heading text-xs rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50"
        >
          <Link href={`/admin/inquiries?schoolId=${school.id}`}>
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            Inquiries
          </Link>
        </Button>

        {/* List/Unlist — §4, READ_WRITE+, independent of approve/reject */}
        {canWrite && (
          <Button
            size="sm"
            variant="outline"
            disabled={loading !== null}
            onClick={handleToggleVisibility}
            className={
              isVisible
                ? "h-8 px-3 font-heading text-xs rounded-lg border-gray-200"
                : "h-8 px-3 font-heading text-xs rounded-lg border-amber-200 text-amber-700 hover:bg-amber-50"
            }
          >
            {loading === "visibility" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isVisible ? (
              <>
                <EyeOff className="h-3.5 w-3.5 mr-1" />
                Unlist
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 mr-1" />
                List
              </>
            )}
          </Button>
        )}

        {/* Approve / Reject — READ_WRITE+, only for PENDING */}
        {currentStatus === "PENDING" && canWrite && (
          <>
            <Button
              size="sm"
              disabled={loading !== null}
              onClick={() => handleApprove(school.id)}
              className="h-8 px-3 bg-green-600 hover:bg-green-700 font-heading text-xs rounded-lg"
            >
              {loading === "approve" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Approve
                </>
              )}
            </Button>
            <Button
              size="sm"
              disabled={loading !== null}
              onClick={() => setModalOpen(true)}
              variant="outline"
              className="h-8 px-3 border-red-200 text-red-600 hover:bg-red-50 font-heading text-xs rounded-lg"
            >
              {loading === "reject" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  Reject
                </>
              )}
            </Button>
          </>
        )}

        {/* Delete — FULL_ACCESS only */}
        {canDelete && (
          <Button
            size="sm"
            disabled={loading !== null}
            onClick={() => setDeleteOpen(true)}
            variant="outline"
            className="h-8 px-3 border-red-200 text-red-600 hover:bg-red-50 font-heading text-xs rounded-lg"
          >
            {loading === "delete" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </>
            )}
          </Button>
        )}
      </div>

      {/* School detail + reject modal */}
      <SchoolDetailModal
        school={school}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onApprove={canWrite ? handleApprove : undefined}
        onReject={canWrite ? handleReject : undefined}
      />

      {/* Delete confirm dialog — only reachable when canDelete is true */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete &quot;{school.name}&quot;?</DialogTitle>
            <DialogDescription>
              This will permanently delete the school, its profile, gallery,
              inquiries, and all related data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={loading !== null}
              className="font-heading text-xs rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleDelete(school.id)}
              disabled={loading !== null}
              className="bg-red-600 hover:bg-red-700 text-white font-heading text-xs rounded-lg"
            >
              {loading === "delete" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Delete School"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}