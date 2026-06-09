import { NextRequest, NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";
import { getAdminApiBase } from "@/lib/admin-auth";
import { getBackendToken } from "@/lib/api/server";
import { revalidateSchoolsCache } from "@/lib/revalidate-schools";

export async function PATCH(request: NextRequest) {
  const token = await getBackendToken();
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }

  const apiBase = getAdminApiBase();
  const schoolResponse = await fetch(`${apiBase}/api/schools/my-school`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const schoolJson = await schoolResponse.json().catch(() => ({}));
  if (!schoolResponse.ok || !schoolJson?.data?.id) {
    return NextResponse.json(
      { success: false, message: "School not found" },
      { status: 404 }
    );
  }

  const body = await request.text();
  const response = await proxyToBackend(`/api/schools/${schoolJson.data.id}`, {
    method: "PATCH",
    body,
  });

  if (response.status >= 200 && response.status < 300) {
    revalidateSchoolsCache();
  }

  return response;
}
