import { proxyToBackend } from "@/lib/api/proxy";
import { revalidateSchoolsCache } from "@/lib/revalidate-schools";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const response = await proxyToBackend(`/api/schools/images/${id}`, {
    method: "DELETE",
  });

  // Invalidate: removed gallery image must disappear from public school detail page
  if (response.status >= 200 && response.status < 300) {
    revalidateSchoolsCache();
  }

  return response;
}
