import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return proxyToBackend(`/api/admin/users/${id}`, {
    method: "DELETE",
  }, { useAdminCookie: true });
}