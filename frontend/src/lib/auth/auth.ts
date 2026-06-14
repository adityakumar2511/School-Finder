import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { Role } from "@/lib/types/database";
import {
  AUTH_CONTEXT_ROLE,
  AUTH_ROUTES,
  type AuthContext,
  UNAUTHORIZED_ACCOUNT_MESSAGE,
} from "@/lib/auth/auth-config";
import { getAdminApiBase } from "@/lib/auth/admin-auth";

const apiBase = () => getAdminApiBase().replace(/\/$/, "");

export const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

type AuthUserWithBackendToken = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: Role;
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
  };
  message?: string;
};

async function loginViaBackend(
  email: string,
  password: string,
  expectedRole: Role
): Promise<AuthUserWithBackendToken> {
  const response = await fetch(`${apiBase()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, expectedRole }),
  });

  const body = (await response.json().catch(() => ({}))) as BackendLoginResponse;

  if (!response.ok || !body.user || !body.token) {
    throw new Error(body.message ?? "Invalid email or password.");
  }

  return {
    id: body.user.id,
    email: body.user.email,
    name: body.user.name,
    image: body.user.image,
    role: body.user.role,
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

  const body = (await response.json().catch(() => ({}))) as BackendLoginResponse;

  if (!response.ok || !body.user || !body.token) {
    return null;
  }

  return {
    id: body.user.id,
    email: body.user.email,
    name: body.user.name,
    image: body.user.image,
    role: body.user.role,
    backendToken: body.token,
  };
}

async function refreshUserFromBackend(
  token: string
): Promise<{ id: string; role: Role; email: string } | null> {
  const response = await fetch(`${apiBase()}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as { id: string; role: Role; email: string };
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
            expectedRole
          );

          if (authUser.role !== expectedRole) {
            throw new Error(UNAUTHORIZED_ACCOUNT_MESSAGE);
          }

          return authUser;
        } catch (error) {
          throw new Error(
            error instanceof Error ? error.message : "Invalid email or password."
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
          return { ...token, id: undefined, role: undefined, backendAccessToken: undefined };
        }

        token.id = synced.id;
        token.role = synced.role;
        token.backendAccessToken = synced.backendToken;
        return token;
      }

      // --- CASE 2: Fresh credentials login (authorize() just ran) ---
      if (user) {
        token.id = user.id;
        token.role = (user as AuthUserWithBackendToken).role ?? "PARENT";

        if ((user as AuthUserWithBackendToken).backendToken) {
          token.backendAccessToken = (user as AuthUserWithBackendToken).backendToken;
        }

        // Don't refresh on fresh login — token is already current
        if (token.role !== "PARENT") {
          token.backendAccessToken = undefined;
        }

        return token;
      }

      // --- CASE 3: Subsequent requests — refresh role from backend ---
      // Only refresh if we have a valid backend token and it's not a
      // manual session update trigger (avoids loop on sign-in)
      const accessToken =
        typeof token.backendAccessToken === "string" ? token.backendAccessToken : null;

      if (accessToken && trigger !== "update") {
        const refreshed = await refreshUserFromBackend(accessToken);
        if (!refreshed) {
          return { ...token, id: undefined, role: undefined, backendAccessToken: undefined };
        }

        token.id = refreshed.id;
        token.role = refreshed.role;
      }

      if (token.role !== "PARENT") {
        token.backendAccessToken = undefined;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
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
    backendToken?: string;
  }
  interface Session {
    backendAccessToken?: string;
    user: {
      id: string;
      role: Role;
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
    backendAccessToken?: string;
  }
}