import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.text();
  return proxyToBackend(`/api/admin/users/${id}/role`, {
    method: "PATCH",
    body,
  }, { useAdminCookie: true });
}
