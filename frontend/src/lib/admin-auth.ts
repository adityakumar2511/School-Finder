/** HTTP-only cookie set after successful backend admin login */
export const ADMIN_TOKEN_COOKIE = "sf_admin_token";

export function getAdminApiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}
