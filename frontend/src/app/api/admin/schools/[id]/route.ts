import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";
import { revalidateSchoolsCache } from "@/lib/seo/revalidate-schools";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  return proxyToBackend(
    `/api/admin/schools/${id}`,   // ← was /api/schools/${id}
    { method: "GET" },
    { useAdminCookie: true },
  );
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.text();

  const response = await proxyToBackend(
    `/api/schools/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body,
    },
    { useAdminCookie: true },
  );

  // Invalidate: edited school's public detail/listing/sitemap must reflect changes
  if (response.status >= 200 && response.status < 300) {
    revalidateSchoolsCache();
  }

  return response;
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const response = await proxyToBackend(
    `/api/schools/${id}`,
    { method: "DELETE" },
    { useAdminCookie: true },
  );

  // Invalidate: deleted school must disappear from listings, detail, cities, sitemap
  if (response.status >= 200 && response.status < 300) {
    revalidateSchoolsCache();
  }

  return response;
}
