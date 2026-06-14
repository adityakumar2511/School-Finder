import Link from "next/link";
import { CheckCircle, Clock, XCircle, ArrowRight } from "lucide-react";
import type { SchoolStatus } from "@/lib/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = {
  status: SchoolStatus;
  rejectionReason?: string | null;
  publicSlug?: string;
};

export default function SchoolStatusCard({
  status,
  rejectionReason,
  publicSlug,
}: Props) {
  if (status === "APPROVED") {
    return (
      <Card className="border-success-text/20 bg-success-bg/80">
        <CardContent className="flex items-start gap-4 p-6">
          <CheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-success-text" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-lg font-bold text-success-text">
                School approved
              </h2>
              <Badge variant="success">Approved</Badge>
            </div>
            <p className="mt-2 font-body text-sm text-success-text/90">
              Your school is live on SchoolFinder. Parents can discover your listing
              and send inquiries.
            </p>
            {publicSlug && (
              <Link
                href={`/schools/${publicSlug}`}
                className="mt-3 inline-flex items-center gap-1 font-heading text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                View public page <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "REJECTED") {
    return (
      <Card className="border-danger-text/20 bg-danger-bg/80">
        <CardContent className="flex items-start gap-4 p-6">
          <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-danger-text" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-lg font-bold text-danger-text">
                Application rejected
              </h2>
              <Badge variant="danger">Rejected</Badge>
            </div>
            {rejectionReason && (
              <p className="mt-2 font-body text-sm text-danger-text/90">
                <span className="font-semibold">Reason:</span> {rejectionReason}
              </p>
            )}
            <p className="mt-2 font-body text-sm text-gray-400">
              Update your school profile and resubmit for review. Contact support if
              you need help.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-warning-text/20 bg-warning-bg/80">
      <CardContent className="flex items-start gap-4 p-6">
        <Clock className="mt-0.5 h-6 w-6 shrink-0 text-warning-text" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-lg font-bold text-warning-text">
              Pending admin review
            </h2>
            <Badge variant="warning">Pending</Badge>
          </div>
          <p className="mt-2 font-body text-sm text-warning-text/90">
            Your school profile is under review. Approval typically takes 24–48
            hours after submission.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
