import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";
import { revalidateSchoolsCache } from "@/lib/revalidate-schools";

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const response = await proxyToBackend(`/api/schools/${id}`, {
    method: "DELETE",
  }, { useAdminCookie: true });

  // Invalidate: deleted school must disappear from listings, detail, cities, sitemap
  if (response.status >= 200 && response.status < 300) {
    revalidateSchoolsCache();
  }

  return response;
}
