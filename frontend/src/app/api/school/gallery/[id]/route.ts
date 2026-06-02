import { proxyToBackend } from "@/lib/api/proxy";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return proxyToBackend(`/api/schools/images/${id}`, { method: "DELETE" });
}
