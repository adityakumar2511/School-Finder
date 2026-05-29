import { encode } from "@auth/core/jwt";

const BACKEND_JWT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type BackendJwtPayload = {
  id: string;
  role: string;
  email: string;
};

/**
 * Mint a backend-compatible JWT (same secret/payload shape as Express login).
 * Used for Google OAuth parents who never call POST /api/auth/login.
 */
export async function mintBackendJwt(
  payload: BackendJwtPayload
): Promise<string | null> {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || !payload.email) return null;

  return encode({
    token: {
      id: payload.id,
      role: payload.role,
      email: payload.email,
    },
    secret,
    salt: secret,
    maxAge: BACKEND_JWT_MAX_AGE_SECONDS,
  });
}
