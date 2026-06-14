import { NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE } from "@/lib/auth/admin-auth";

const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: Request) {
  try {
    const { token } = (await request.json()) as { token?: string };

    if (!token || typeof token !== "string") {
      return NextResponse.json({ message: "Token is required" }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
    });

    return response;
  } catch {
    return NextResponse.json({ message: "Failed to store session" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ADMIN_TOKEN_COOKIE);
  return response;
}
