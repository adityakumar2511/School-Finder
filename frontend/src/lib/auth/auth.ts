import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { Role, AdminAccessLevel } from "@/lib/types/database";
import {
  AUTH_CONTEXT_ROLE,
  AUTH_ROUTES,
  type AuthContext,
  UNAUTHORIZED_ACCOUNT_MESSAGE,
} from "@/lib/auth/auth-config";
import { getAdminApiBase } from "@/lib/auth/admin-auth";
import { mintBackendJwt } from "@/lib/auth/backend-jwt";

const apiBase = () => getAdminApiBase().replace(/\/$/, "");

export const authSecret =
  process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

type AuthUserWithBackendToken = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: Role;
  adminAccessLevel?: AdminAccessLevel | null;
  backendToken?: string;
};

type BackendLoginResponse = {
  token?: string;
  user?: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: Role;
    adminAccessLevel?: AdminAccessLevel | null;
  };
  message?: string;
};

async function loginViaBackend(
  email: string,
  password: string,
  expectedRole: Role,
): Promise<AuthUserWithBackendToken> {
  const response = await fetch(`${apiBase()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, expectedRole }),
  });

  const body = (await response
    .json()
    .catch(() => ({}))) as BackendLoginResponse;

  if (!response.ok || !body.user || !body.token) {
    throw new Error(body.message ?? "Invalid email or password.");
  }

  return {
    id: body.user.id,
    email: body.user.email,
    name: body.user.name,
    image: body.user.image,
    role: body.user.role,
    adminAccessLevel: body.user.adminAccessLevel ?? null,
    backendToken: body.token,
  };
}

async function syncGoogleViaBackend(profile: {
  email: string;
  name?: string | null;
  image?: string | null;
}): Promise<AuthUserWithBackendToken | null> {
  const response = await fetch(`${apiBase()}/api/auth/google-sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });

  const body = (await response
    .json()
    .catch(() => ({}))) as BackendLoginResponse;

  if (!response.ok || !body.user || !body.token) {
    return null;
  }

  return {
    id: body.user.id,
    email: body.user.email,
    name: body.user.name,
    image: body.user.image,
    role: body.user.role,
    adminAccessLevel: body.user.adminAccessLevel ?? null,
    backendToken: body.token,
  };
}

async function refreshUserFromBackend(
  token: string,
): Promise<{ id: string; role: Role; email: string; adminAccessLevel?: AdminAccessLevel | null } | null> {
  const response = await fetch(`${apiBase()}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as {
    id: string;
    role: Role;
    email: string;
    adminAccessLevel?: AdminAccessLevel | null;
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  trustHost: true,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        authContext: { label: "Auth context", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const context = (credentials.authContext as AuthContext) || "parent";
        const expectedRole = AUTH_CONTEXT_ROLE[context];

        try {
          const authUser = await loginViaBackend(
            credentials.email as string,
            credentials.password as string,
            expectedRole,
          );

          if (authUser.role !== expectedRole) {
            throw new Error(UNAUTHORIZED_ACCOUNT_MESSAGE);
          }

          return authUser;
        } catch (error) {
          throw new Error(
            error instanceof Error
              ? error.message
              : "Invalid email or password.",
          );
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 1800,
  },

  jwt: {
    maxAge: 1800,
  },

  pages: {
    signIn: AUTH_ROUTES.parentLogin,
  },

  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        const email = profile?.email?.trim().toLowerCase();
        if (!email) return false;

        const synced = await syncGoogleViaBackend({
          email,
          name: typeof profile?.name === "string" ? profile.name : null,
          image: typeof profile?.picture === "string" ? profile.picture : null,
        });

        return synced?.role === "PARENT";
      }

      return true;
    },

    async jwt({ token, user, account, profile, trigger }) {
      // --- CASE 1: Google OAuth login ---
      if (account?.provider === "google" && profile?.email) {
        const synced = await syncGoogleViaBackend({
          email: profile.email.trim().toLowerCase(),
          name: typeof profile.name === "string" ? profile.name : null,
          image: typeof profile.picture === "string" ? profile.picture : null,
        });

        if (!synced) {
          return {
            ...token,
            id: undefined,
            role: undefined,
            backendAccessToken: undefined,
          };
        }

        token.id = synced.id;
        token.email = synced.email;
        token.role = synced.role;
        token.adminAccessLevel = synced.adminAccessLevel ?? null;
        token.backendAccessToken = synced.backendToken;
        return token;
      }

      // --- CASE 2: Fresh credentials login (authorize() just ran) ---
      if (user) {
        token.id = user.id;
        token.email = user.email ?? (token.email as string | undefined);
        token.role = (user as AuthUserWithBackendToken).role ?? "PARENT";
        token.adminAccessLevel =
          (user as AuthUserWithBackendToken).adminAccessLevel ?? null;

        if ((user as AuthUserWithBackendToken).backendToken) {
          token.backendAccessToken = (
            user as AuthUserWithBackendToken
          ).backendToken;
        }

        if (token.role !== "PARENT") {
          token.backendAccessToken = undefined;
        }

        return token;
      }

      // --- CASE 3: Subsequent requests — revalidate against backend ---
      // FIXED: previously this block only ran when token.backendAccessToken
      // was already present in the JWT — but backendAccessToken is stripped
      // for SCHOOL_ADMIN and ADMIN roles right after login (see CASE 2 above
      // and the bottom of this block). That meant SCHOOL_ADMIN/ADMIN sessions
      // NEVER re-checked the backend after initial login, so a school admin
      // disabled mid-session could keep using their existing session for up
      // to 30 minutes (the JWT maxAge) without ever being re-validated.
      //
      // Fix: mint a fresh short-lived backend token via mintBackendJwt() when
      // we don't already have one, so the revalidation call to /api/auth/me
      // (which now also checks the disabled-account sentinel) runs for every
      // role, not just PARENT.
      if (trigger !== "update" && token.id && token.role && token.email) {
        const revalidationToken =
          typeof token.backendAccessToken === "string"
            ? token.backendAccessToken
            : mintBackendJwt({
                id: token.id as string,
                role: token.role as string,
                email: token.email as string,
              });

        if (revalidationToken) {
          const refreshed = await refreshUserFromBackend(revalidationToken);

          if (!refreshed) {
            // Backend rejected the token — user not found, deleted, or
            // (most importantly) account disabled. Kill the session.
            return {
              ...token,
              id: undefined,
              role: undefined,
              backendAccessToken: undefined,
            };
          }

          token.id = refreshed.id;
          token.email = refreshed.email;
          token.role = refreshed.role;
          token.adminAccessLevel = refreshed.adminAccessLevel ?? null;
        }
      }

      // Strip backendAccessToken for non-PARENT roles AFTER revalidation,
      // not before — otherwise the check above would never have a token
      // to revalidate with on the very next request.
      if (token.role !== "PARENT") {
        token.backendAccessToken = undefined;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.adminAccessLevel =
          (token.adminAccessLevel as AdminAccessLevel) ?? null;
      }

      if (typeof token.backendAccessToken === "string") {
        session.backendAccessToken = token.backendAccessToken;
      }

      return session;
    },
  },
});

declare module "next-auth" {
  interface User {
    role?: Role;
    adminAccessLevel?: AdminAccessLevel | null;
    backendToken?: string;
  }
  interface Session {
    backendAccessToken?: string;
    user: {
      id: string;
      role: Role;
      adminAccessLevel?: AdminAccessLevel | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    adminAccessLevel?: AdminAccessLevel | null;
    backendAccessToken?: string;
  }
}