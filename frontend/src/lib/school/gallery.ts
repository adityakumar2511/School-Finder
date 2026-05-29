import prisma from "@/lib/prisma";

export async function getSchoolGalleryImages(ownerId: string) {
  const school = await prisma.school.findFirst({
    where: { ownerId },
    select: {
      images: {
        orderBy: { createdAt: "desc" },
        select: { id: true, url: true, caption: true },
      },
    },
  });

  return school?.images ?? [];
}
