import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.toString();
  const path = query ? `/api/admin/schools?${query}` : "/api/admin/schools";
  return proxyToBackend(path, { method: "GET" }, { useAdminCookie: true });
}
