import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "SCHOOL_ADMIN") {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }

  const school = await prisma.school.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true },
  });

  if (!school) {
    return NextResponse.json(
      { success: false, message: "School not found" },
      { status: 404 }
    );
  }

  const body = await request.json().catch(() => ({}));

  const allowedFields = [
    "name",
    "description",
    "address",
    "city",
    "state",
    "pincode",
    "board",
    "schoolType",
    "medium",
    "classesFrom",
    "classesTo",
    "phone",
    "email",
    "website",
    "logoUrl",
    "admissionFee",
    "tuitionFeeMonthly",
    "totalAnnualFee",
    "transportFee",
    "hostelFee",
    "totalStudents",
    "establishedYear",
  ] as const;

  const data: Record<string, unknown> = {};

  for (const key of allowedFields) {
    if (body[key] !== undefined) {
      data[key] = body[key];
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { success: false, message: "No valid fields to update" },
      { status: 400 }
    );
  }

  const updated = await prisma.school.update({
    where: { id: school.id },
    data: {
      ...data,
      status: "PENDING",
    },
  });

  return NextResponse.json({
    success: true,
    school: updated,
    message:
      "School profile updated. Your listing is pending admin re-approval.",
  });
}
