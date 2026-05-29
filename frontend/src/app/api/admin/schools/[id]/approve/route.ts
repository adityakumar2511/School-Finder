import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin/session";

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  const { id } = await context.params;

  const school = await prisma.school.update({
    where: { id },
    data: { status: "APPROVED", rejectionReason: null },
  });

  return NextResponse.json({ message: "School approved successfully", school });
}
