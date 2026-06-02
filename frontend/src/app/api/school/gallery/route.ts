import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";

export async function GET() {
  const schoolResponse = await proxyToBackend("/api/schools/my-school");
  const schoolJson = await schoolResponse.json();
  const images = schoolJson?.data?.images ?? [];
  return Response.json({ success: true, images }, { status: schoolResponse.status });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyToBackend("/api/schools/my-school/images", {
    method: "POST",
    body,
  });
}
