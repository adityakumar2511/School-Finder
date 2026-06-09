import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";

export async function GET() {
  return proxyToBackend("/api/parent/favourites", { method: "GET" });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyToBackend("/api/parent/favourites", {
    method: "POST",
    body,
  });
}

export async function DELETE(request: NextRequest) {
  const schoolId = request.nextUrl.searchParams.get("schoolId");
  return proxyToBackend(
    `/api/parent/favourites?schoolId=${encodeURIComponent(schoolId ?? "")}`,
    { method: "DELETE" }
  );
}
