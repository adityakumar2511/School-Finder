import { NextRequest, NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin/session";
import { isAccountDisabled } from "@/lib/admin/constants";

const VALID_ROLES: Role[] = ["PARENT", "SCHOOL_ADMIN", "ADMIN"];

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
  const role = body.role as Role;

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ message: "Invalid role" }, { status: 400 });
  }

  if (id === session.user.id && role !== "ADMIN") {
    return NextResponse.json(
      { message: "You cannot demote your own admin account" },
      { status: 403 }
    );
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (target.role === "ADMIN" && role !== "ADMIN" && adminCount <= 1) {
    return NextResponse.json(
      { message: "Cannot remove the last administrator" },
      { status: 403 }
    );
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
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
    message: "User role updated",
    user: {
      ...updated,
      accountStatus: isAccountDisabled(updated.phone) ? "disabled" : "active",
    },
  });
}
