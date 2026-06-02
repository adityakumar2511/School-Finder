import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";

export async function DELETE(request: NextRequest) {
  const schoolId = request.nextUrl.searchParams.get("schoolId");
  return proxyToBackend(
    `/api/parent/favourites?schoolId=${encodeURIComponent(schoolId ?? "")}`,
    { method: "DELETE" }
  );
}
