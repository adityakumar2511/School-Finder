import { revalidateTag } from "next/cache";

export function revalidateSchoolsCache(): void {
  revalidateTag("schools");
}

