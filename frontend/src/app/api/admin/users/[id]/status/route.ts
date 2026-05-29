import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin/session";
import {
  ACCOUNT_DISABLED_PHONE,
  isAccountDisabled,
} from "@/lib/admin/constants";

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
  const status = body.status as string;

  if (!["active", "disabled"].includes(status)) {
    return NextResponse.json(
      { message: "Invalid status. Use active or disabled." },
      { status: 400 }
    );
  }

  if (id === session.user.id) {
    return NextResponse.json(
      { message: "You cannot change your own account status" },
      { status: 403 }
    );
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (target.role === "ADMIN" && status === "disabled") {
    const activeAdmins = await prisma.user.count({
      where: { role: "ADMIN", NOT: { phone: ACCOUNT_DISABLED_PHONE } },
    });
    if (activeAdmins <= 1) {
      return NextResponse.json(
        { message: "Cannot disable the last active administrator" },
        { status: 403 }
      );
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      phone: status === "disabled" ? ACCOUNT_DISABLED_PHONE : null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    message: status === "disabled" ? "Account disabled" : "Account enabled",
    user: {
      ...updated,
      accountStatus: isAccountDisabled(updated.phone) ? "disabled" : "active",
    },
  });
}
