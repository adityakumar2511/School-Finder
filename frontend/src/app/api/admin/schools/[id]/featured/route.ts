import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/proxy";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyToBackend(`/api/admin/schools/${params.id}/featured`, req, {
    useAdminCookie: true,
  });
}