import { proxyToBackend } from "@/lib/api/proxy";

export async function POST(req: Request) {
  const body = await req.json();

  return proxyToBackend(
    "/api/admin/add-parent",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    { useAdminCookie: true }
  );
}