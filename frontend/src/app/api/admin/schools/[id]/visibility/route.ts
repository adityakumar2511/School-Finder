import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";
import { revalidateSchoolsCache } from "@/lib/seo/revalidate-schools";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  // Optional body: { isVisible?: boolean }. If omitted, backend flips current value.
  const body = await request.json().catch(() => ({}));

  const response = await proxyToBackend(
    `/api/admin/schools/${id}/visibility`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
    { useAdminCookie: true }
  );

  // Invalidate: visibility change must reflect in public listing/detail immediately
  if (response.status >= 200 && response.status < 300) {
    revalidateSchoolsCache();
  }

  return response;
}