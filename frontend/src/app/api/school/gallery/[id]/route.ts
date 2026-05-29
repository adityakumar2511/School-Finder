import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { deleteImageByUrl } from "@/lib/cloudinary";

export async function DELETE(
  _request: Request,
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

  const image = await prisma.schoolImage.findFirst({
    where: { id, schoolId: school.id },
  });

  if (!image) {
    return NextResponse.json(
      { success: false, message: "Image not found" },
      { status: 404 }
    );
  }

  await prisma.schoolImage.delete({ where: { id } });

  try {
    await deleteImageByUrl(image.url);
  } catch {
    // Gallery record removed even if Cloudinary cleanup fails
  }

  return NextResponse.json({ success: true, message: "Image removed" });
}
