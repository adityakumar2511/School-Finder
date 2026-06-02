import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sf_admin_token")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Session expired. Please log in again as admin." },
      { status: 401 }
    );
  }

  const body = await req.json();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const backendRes = await fetch(`${apiUrl}/api/admin/add-school`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json().catch(() => ({}));

  return NextResponse.json(data, { status: backendRes.status });
}
