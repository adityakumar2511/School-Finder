import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";

export async function PATCH(request: NextRequest) {
  const body = await request.text();
  return proxyToBackend("/api/parent/profile", {
    method: "PATCH",
    body,
  });
}
