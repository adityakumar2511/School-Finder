import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_TOKEN_COOKIE, getAdminApiBase } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const backendRes = await fetch(`${getAdminApiBase()}/api/admin/add-school`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await backendRes.json().catch(() => ({}));

  return NextResponse.json(data, { status: backendRes.status });
}
