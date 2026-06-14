"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import type { SchoolStatus } from "@/lib/types/database";
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
};

export default function SchoolModerationActions({ school, currentStatus }: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

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

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setModalOpen(true)}
          className="h-8 px-3 font-heading text-xs rounded-lg border-gray-200"
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          View
        </Button>

        {currentStatus === "PENDING" && (
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
      </div>

      <SchoolDetailModal
        school={school}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </>
  );
}