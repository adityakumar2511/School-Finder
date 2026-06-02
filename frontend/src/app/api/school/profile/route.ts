import { NextRequest, NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";
import { getAdminApiBase } from "@/lib/admin-auth";
import { mintBackendJwt } from "@/lib/backend-jwt";
import { auth } from "@/lib/auth";

async function getSchoolAdminToken(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return null;

  if (typeof session.backendAccessToken === "string" && session.backendAccessToken.length > 0) {
    return session.backendAccessToken;
  }

  return mintBackendJwt({
    id: session.user.id,
    role: session.user.role,
    email: session.user.email,
  });
}

export async function PATCH(request: NextRequest) {
  const token = await getSchoolAdminToken();
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
  return proxyToBackend(`/api/schools/${schoolJson.data.id}`, {
    method: "PATCH",
    body,
  });
}
