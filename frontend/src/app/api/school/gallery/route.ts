import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
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

  const images = await prisma.schoolImage.findMany({
    where: { schoolId: school.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, url: true, caption: true },
  });

  return NextResponse.json({ success: true, images });
}

export async function POST(request: NextRequest) {
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
  const url = typeof body.url === "string" ? body.url.trim() : "";
  const caption =
    typeof body.caption === "string" ? body.caption.trim() || null : null;

  if (!url.startsWith("https://")) {
    return NextResponse.json(
      { success: false, message: "A valid image URL is required" },
      { status: 400 }
    );
  }

  const image = await prisma.schoolImage.create({
    data: {
      schoolId: school.id,
      url,
      caption,
    },
    select: { id: true, url: true, caption: true },
  });

  return NextResponse.json({ success: true, image });
}
