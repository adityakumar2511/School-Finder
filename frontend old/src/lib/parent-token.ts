export const PARENT_BACKEND_TOKEN_KEY = "sf_parent_token";

/** Persist backend JWT for Express API calls (client-only). */
export function storeParentBackendToken(token: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PARENT_BACKEND_TOKEN_KEY, token);
}

export function clearParentBackendToken(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PARENT_BACKEND_TOKEN_KEY);
}

export function getParentBackendToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(PARENT_BACKEND_TOKEN_KEY);
}
