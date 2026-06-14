import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";
import { revalidateSchoolsCache } from "@/lib/seo/revalidate-schools";

export async function GET() {
  const schoolResponse = await proxyToBackend("/api/schools/my-school");
  const schoolJson = await schoolResponse.json();
  const images = schoolJson?.data?.images ?? [];
  return Response.json({ success: true, images }, { status: schoolResponse.status });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const response = await proxyToBackend("/api/schools/my-school/images", {
    method: "POST",
    body,
  });

  // Invalidate: new gallery image appears on public school detail page
  if (response.status >= 200 && response.status < 300) {
    revalidateSchoolsCache();
  }

  return response;
}
