import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin/session";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const reason =
    typeof body.reason === "string" && body.reason.trim()
      ? body.reason.trim()
      : "Rejected by administrator";

  const school = await prisma.school.update({
    where: { id },
    data: { status: "REJECTED", rejectionReason: reason },
  });

  return NextResponse.json({ message: "School rejected successfully", school });
}
