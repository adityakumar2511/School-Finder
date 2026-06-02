import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";

export async function PATCH(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return proxyToBackend(`/api/admin/schools/${id}/approve`, {
    method: "PATCH",
  }, { useAdminCookie: true });
}
