import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";
import { revalidateSchoolsCache } from "@/lib/seo/revalidate-schools";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.text();
  const response = await proxyToBackend(`/api/admin/schools/${id}/reject`, {
    method: "PATCH",
    body,
  }, { useAdminCookie: true });

  // Invalidate: rejected school must disappear from public listings immediately
  if (response.status >= 200 && response.status < 300) {
    revalidateSchoolsCache();
  }

  return response;
}
