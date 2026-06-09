import crypto from "crypto";
import jwt from "jsonwebtoken";

const BACKEND_JWT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
const JWT_ISSUER = "schoolfinder-api";

export type BackendJwtPayload = {
  id: string;
  role: string;
  email: string;
};

/**
 * Mint a backend-compatible HS256 JWT using jsonwebtoken (same as Express signAccessToken).
 * Replaces the jose SignJWT which was producing JWE tokens the backend cannot verify.
 */
export function mintBackendJwt(
  payload: BackendJwtPayload
): string | null {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || !payload.email) return null;

  return jwt.sign(
    {
      id: payload.id,
      role: payload.role,
      email: payload.email,
      jti: crypto.randomUUID(),
    },
    secret,
    {
      algorithm: "HS256",
      issuer: JWT_ISSUER,
      expiresIn: BACKEND_JWT_MAX_AGE_SECONDS,
    }
  );
}