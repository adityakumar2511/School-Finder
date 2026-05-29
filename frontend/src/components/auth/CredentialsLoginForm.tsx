"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { AuthContext } from "@/lib/auth-config";
import {
  AUTH_CONTEXT_ROLE,
  ROLE_HOME,
  UNAUTHORIZED_ACCOUNT_MESSAGE,
} from "@/lib/auth-config";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

type Props = {
  authContext: AuthContext;
  title: string;
  subtitle: string;
  showGoogle?: boolean;
  footer?: React.ReactNode;
};

export default function CredentialsLoginForm({
  authContext,
  title,
  subtitle,
  showGoogle = false,
  footer,
}: Props) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const expectedRole = AUTH_CONTEXT_ROLE[authContext];
  const redirectHome = ROLE_HOME[expectedRole];

  async function handleGoogleLogin() {
    if (!showGoogle) return;
    setGoogleLoading(true);
    setError(null);
    try {
      const result = await signIn("google", { redirect: false });
      if (!result?.ok) {
        setError("Google sign-in failed. Please try again.");
        return;
      }
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      if (session?.user?.role !== expectedRole) {
        const { signOut } = await import("next-auth/react");
        await signOut({ redirect: false });
        setError(UNAUTHORIZED_ACCOUNT_MESSAGE);
        return;
      }
      router.push(redirectHome);
      router.refresh();
    } finally {
      setGoogleLoading(false);
    }
  }

  async function onSubmit(data: LoginFormData) {
    setError(null);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      authContext,
      redirect: false,
    });

    if (result?.error) {
      setError(
        result.error === UNAUTHORIZED_ACCOUNT_MESSAGE
          ? UNAUTHORIZED_ACCOUNT_MESSAGE
          : "Invalid email or password."
      );
      return;
    }

    if (result?.ok) {
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      if (session?.user?.role !== expectedRole) {
        const { signOut } = await import("next-auth/react");
        await signOut({ redirect: false });
        setError(UNAUTHORIZED_ACCOUNT_MESSAGE);
        return;
      }
      router.push(redirectHome);
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-subtle-pattern pointer-events-none" aria-hidden="true" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-btn mb-4">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-heading text-h2 text-blue-800 mb-1">{title}</h1>
          <p className="font-body text-body text-gray-400">{subtitle}</p>
        </div>

        <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
          <CardHeader className="pb-0 pt-6 px-6" />
          <CardContent className="px-6 pb-6 space-y-5">
            {showGoogle && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 border-gray-100 hover:border-blue-200 hover:bg-blue-50 font-heading text-btn text-gray-800 transition-all duration-200 rounded-xl flex items-center justify-center gap-3"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Continue with Google
                </Button>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="font-body text-meta text-gray-400 px-1">or</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
              </>
            )}

            {error && (
              <div className="rounded-xl bg-danger-bg border border-danger-text/20 px-4 py-3">
                <p className="font-body text-label text-danger-text">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="font-heading text-label text-gray-800">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`pl-10 h-11 rounded-xl border font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 transition-colors ${
                      errors.email ? "border-danger-text bg-danger-bg/30" : "border-gray-100 bg-gray-50 focus:bg-white"
                    }`}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="font-body text-meta text-danger-text">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="font-heading text-label text-gray-800">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`pl-10 pr-10 h-11 rounded-xl border font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 transition-colors ${
                      errors.password ? "border-danger-text bg-danger-bg/30" : "border-gray-100 bg-gray-50 focus:bg-white"
                    }`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="font-body text-meta text-danger-text">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-heading text-btn rounded-xl shadow-btn transition-all duration-200 flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {footer}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
