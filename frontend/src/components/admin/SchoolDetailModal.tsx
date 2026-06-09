"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Globe,
  GraduationCap,
  Users,
  Calendar,
} from "lucide-react";
import type { SchoolStatus } from "@/lib/types/database";

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
  open: boolean;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
};

export default function SchoolDetailModal({
  school,
  open,
  onClose,
  onApprove,
  onReject,
}: Props) {
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  function handleClose() {
    setRejectMode(false);
    setReason("");
    setReasonError("");
    onClose();
  }

  async function handleApprove() {
    setLoading("approve");
    try {
      await onApprove(school.id);
      handleClose();
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    if (!reason.trim()) {
      setReasonError("Rejection reason is required");
      return;
    }
    setLoading("reject");
    try {
      await onReject(school.id, reason.trim());
      handleClose();
    } finally {
      setLoading(null);
    }
  }

  const isPending = school.status === "PENDING";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold text-xl text-blue-800 pr-6">
            {school.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Logo + basic */}
          <div className="flex items-center gap-4">
            {school.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={school.logoUrl}
                alt={school.name}
                className="h-14 w-14 rounded-xl object-cover border border-gray-100"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 font-heading font-bold text-xl text-blue-700">
                {school.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-body text-sm text-gray-500">
                Owner: <span className="text-gray-800">{school.owner.name ?? "—"}</span>{" "}
                · {school.owner.email}
              </p>
              <p className="font-body text-sm text-gray-400">
                Registered: {new Date(school.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Academic badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{school.board.replace("_", " ")}</Badge>
            <Badge variant="secondary">{school.schoolType.replace("_", " ")}</Badge>
            <Badge variant="secondary">{school.medium}</Badge>
            <Badge variant="secondary">
              Class {school.classesFrom}–{school.classesTo}
            </Badge>
          </div>

          {/* Location + contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="font-body text-sm text-gray-700">
                {school.address}, {school.city}, {school.state}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <p className="font-body text-sm text-gray-700">{school.phone}</p>
            </div>
            {school.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <p className="font-body text-sm text-gray-700">{school.email}</p>
              </div>
            )}
            {school.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <a
                  href={school.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-sm text-blue-600 hover:underline truncate"
                >
                  {school.website}
                </a>
              </div>
            )}
          </div>

          {/* Stats row */}
          {(school.totalStudents || school.establishedYear) && (
            <div className="flex gap-4">
              {school.establishedYear && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="font-body text-sm text-gray-700">Est. {school.establishedYear}</p>
                </div>
              )}
              {school.totalStudents && (
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-gray-400" />
                  <p className="font-body text-sm text-gray-700">{school.totalStudents} students</p>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {school.description && (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="font-body text-sm text-gray-700">{school.description}</p>
            </div>
          )}

          {/* Fees */}
          {(school.admissionFee || school.tuitionFeeMonthly || school.totalAnnualFee) && (
            <div>
              <p className="font-heading font-semibold text-sm text-gray-800 mb-2 flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" /> Fee structure
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { label: "Admission", value: school.admissionFee },
                  { label: "Monthly tuition", value: school.tuitionFeeMonthly },
                  { label: "Annual", value: school.totalAnnualFee },
                  { label: "Transport", value: school.transportFee },
                  { label: "Hostel", value: school.hostelFee },
                ]
                  .filter((f) => f.value)
                  .map((f) => (
                    <div key={f.label} className="p-2 bg-blue-50 rounded-lg">
                      <p className="font-body text-xs text-gray-500">{f.label}</p>
                      <p className="font-heading font-semibold text-sm text-blue-800">
                        ₹{f.value?.toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Existing rejection reason if any */}
          {school.rejectionReason && school.status === "REJECTED" && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200">
              <p className="font-heading font-semibold text-sm text-red-700 mb-1">
                Previous rejection reason
              </p>
              <p className="font-body text-sm text-red-700">{school.rejectionReason}</p>
            </div>
          )}

          {/* Reject reason input */}
          {rejectMode && (
            <div className="space-y-1.5">
              <Label className="font-heading text-sm text-gray-800">
                Rejection reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                rows={3}
                placeholder="Explain why this school is being rejected..."
                className="rounded-xl border border-gray-200 font-body text-sm resize-none"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (e.target.value.trim()) setReasonError("");
                }}
              />
              {reasonError && (
                <p className="font-body text-xs text-red-500">{reasonError}</p>
              )}
            </div>
          )}

          {/* Action buttons — only for PENDING */}
          {isPending && (
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              {!rejectMode ? (
                <>
                  <Button
                    onClick={handleApprove}
                    disabled={loading !== null}
                    className="flex-1 h-10 bg-green-600 hover:bg-green-700 font-heading text-sm rounded-xl"
                  >
                    {loading === "approve" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setRejectMode(true)}
                    disabled={loading !== null}
                    variant="outline"
                    className="flex-1 h-10 border-red-200 text-red-600 hover:bg-red-50 font-heading text-sm rounded-xl"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleReject}
                    disabled={loading !== null}
                    className="flex-1 h-10 bg-red-600 hover:bg-red-700 font-heading text-sm rounded-xl"
                  >
                    {loading === "reject" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Confirm rejection
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => { setRejectMode(false); setReason(""); setReasonError(""); }}
                    disabled={loading !== null}
                    variant="outline"
                    className="h-10 font-heading text-sm rounded-xl"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}