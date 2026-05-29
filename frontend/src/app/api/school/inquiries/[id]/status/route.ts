import { NextRequest, NextResponse } from "next/server";
import type { InquiryStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { assertInquiryOwnedBySchool } from "@/lib/school/data";

const VALID: InquiryStatus[] = ["NEW", "CONTACTED", "CLOSED"];

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "SCHOOL_ADMIN") {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const status = body.status as InquiryStatus;

  if (!VALID.includes(status)) {
    return NextResponse.json(
      { success: false, message: "Invalid status" },
      { status: 400 }
    );
  }

  const owned = await assertInquiryOwnedBySchool(id, session.user.id);

  if (!owned) {
    return NextResponse.json(
      { success: false, message: "Inquiry not found" },
      { status: 404 }
    );
  }

  const updated = await prisma.inquiry.update({
    where: { id },
    data: { status },
    include: {
      parent: { select: { name: true, email: true, phone: true } },
    },
  });

  return NextResponse.json({ success: true, inquiry: updated });
}
