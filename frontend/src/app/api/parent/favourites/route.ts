import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "PARENT") {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }

  const schoolId = request.nextUrl.searchParams.get("schoolId");

  if (!schoolId) {
    return NextResponse.json(
      { success: false, message: "schoolId is required" },
      { status: 400 }
    );
  }

  try {
    await prisma.favourite.delete({
      where: {
        parentId_schoolId: {
          parentId: session.user.id,
          schoolId,
        },
      },
    });

    return NextResponse.json({ success: true, message: "Favourite removed successfully" });
  } catch {
    return NextResponse.json(
      { success: false, message: "Favourite not found" },
      { status: 404 }
    );
  }
}
