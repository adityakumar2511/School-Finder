import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";
import { revalidateSchoolsCache } from "@/lib/seo/revalidate-schools";

export async function PATCH(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const response = await proxyToBackend(`/api/admin/schools/${id}/approve`, {
    method: "PATCH",
  }, { useAdminCookie: true });

  // Invalidate: approved school must appear in public listings and detail immediately
  if (response.status >= 200 && response.status < 300) {
    revalidateSchoolsCache();
  }

  return response;
}
