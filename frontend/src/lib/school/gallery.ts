import { getOwnedSchool } from "@/lib/school/data";

export async function getSchoolGalleryImages(ownerId: string) {
  void ownerId;
  const school = await getOwnedSchool();
  return school?.images ?? [];
}
