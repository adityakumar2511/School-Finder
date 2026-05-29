import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "PARENT") {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const phone =
    typeof body.phone === "string" ? body.phone.trim() || null : undefined;
  const image =
    typeof body.image === "string" ? body.image.trim() || null : undefined;

  if (name !== undefined && name.length < 1) {
    return NextResponse.json(
      { success: false, message: "Name is required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(image !== undefined ? { image } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ success: true, user });
}
