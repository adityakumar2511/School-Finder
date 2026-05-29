import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import type { Role } from "@prisma/client";
import { mintBackendJwt } from "@/lib/backend-jwt";
import {
  AUTH_CONTEXT_ROLE,
  AUTH_ROUTES,
  type AuthContext,
  UNAUTHORIZED_ACCOUNT_MESSAGE,
} from "@/lib/auth-config";

/**
 * Parent and school flows use this NextAuth config (Google + credentials).
 * Admin sign-in at /admin-login uses POST /api/auth/login with expectedRole ADMIN,
 * stores the backend JWT cookie, then syncs session via credentials (authContext admin).
 *
 * JWT includes `id` and `role` for middleware (`getToken` in frontend/middleware.ts).
 * Parent JWT also includes `backendAccessToken` for Express API calls from the client.
 *
 * Logout: use `performLogout(role)` from `@/lib/logout` (Navbar). It calls `signOut()`,
 * clears the admin HTTP-only cookie when needed, and hard-redirects via ROLE_LOGOUT_REDIRECT.
 */

/** Used by middleware and NextAuth — prefer AUTH_SECRET in production */
export const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

type AuthUserWithBackendToken = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: Role;
  backendToken?: string;
};

async function attachParentBackendToken(
  token: { id?: string; role?: Role; backendAccessToken?: string },
  user?: AuthUserWithBackendToken | null
): Promise<void> {
  if (token.role !== "PARENT") return;

  if (user?.backendToken) {
    token.backendAccessToken = user.backendToken;
    return;
  }

  const userId = (user?.id ?? token.id) as string | undefined;
  const email = user?.email;

  if (userId && email) {
    const minted = await mintBackendJwt({
      id: userId,
      role: "PARENT",
      email,
    });
    if (minted) {
      token.backendAccessToken = minted;
    }
    return;
  }

  if (!token.id || token.backendAccessToken) return;

  const dbUser = await prisma.user.findUnique({
    where: { id: token.id as string },
    select: { id: true, email: true, role: true },
  });

  if (dbUser?.role === "PARENT" && dbUser.email) {
    const minted = await mintBackendJwt({
      id: dbUser.id,
      role: dbUser.role,
      email: dbUser.email,
    });
    if (minted) {
      token.backendAccessToken = minted;
    }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  trustHost: true,
  adapter: PrismaAdapter(prisma),

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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password.");
        }

        if (user.phone === "__DISABLED__") {
          throw new Error("This account has been disabled.");
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid email or password.");
        }

        if (user.role !== expectedRole) {
          throw new Error(UNAUTHORIZED_ACCOUNT_MESSAGE);
        }

        const authUser: AuthUserWithBackendToken = {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };

        if (context === "parent" && user.role === "PARENT") {
          const apiBase =
            process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
            "http://localhost:4000";

          try {
            const loginResponse = await fetch(`${apiBase}/api/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
                expectedRole: "PARENT",
              }),
            });

            if (loginResponse.ok) {
              const loginBody = (await loginResponse.json()) as {
                token?: string;
              };
              if (loginBody.token) {
                authUser.backendToken = loginBody.token;
              }
            }
          } catch {
            // NextAuth sign-in continues; client may still store token from login page.
          }
        }

        return authUser;
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
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email?.trim().toLowerCase();
        if (!email) return false;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing && existing.role !== "PARENT") {
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as AuthUserWithBackendToken).role ?? "PARENT";

        if (token.role === "PARENT") {
          await attachParentBackendToken(token, user as AuthUserWithBackendToken);
        }
      }

      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (!dbUser) {
          return { ...token, id: undefined, role: undefined, backendAccessToken: undefined };
        }
        token.role = dbUser.role;

        if (dbUser.role === "PARENT") {
          await attachParentBackendToken(token);
        } else {
          token.backendAccessToken = undefined;
        }
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
