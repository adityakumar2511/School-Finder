"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, GraduationCap, Mail, Lock, ArrowRight } from "lucide-react";
import AuthRoleGuard from "@/components/auth/AuthRoleGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getAdminApiBase } from "@/lib/admin-auth";
import { AUTH_ROUTES, ROLE_HOME, UNAUTHORIZED_ACCOUNT_MESSAGE } from "@/lib/auth-config";

function sanitizeCallbackUrl(raw: string | null): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  if (value.includes("://") || value.includes("\\")) return null;
  return value;
}

const schoolLoginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SchoolLoginForm = z.infer<typeof schoolLoginSchema>;

export default function SchoolLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postLoginPath =
    sanitizeCallbackUrl(searchParams.get("callbackUrl")) ?? ROLE_HOME.SCHOOL_ADMIN;
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SchoolLoginForm>({ resolver: zodResolver(schoolLoginSchema) });

  async function onSubmit(data: SchoolLoginForm) {
    setError(null);

    try {
      const res = await fetch(`${getAdminApiBase()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          expectedRole: "SCHOOL_ADMIN",
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (res.status === 403) {
        setError(body.message ?? UNAUTHORIZED_ACCOUNT_MESSAGE);
        return;
      }

      if (!res.ok) {
        setError(body.message ?? "Invalid email or password.");
        return;
      }

      const nextAuthResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        authContext: "school",
        redirect: false,
      });

      if (nextAuthResult?.error) {
        setError(UNAUTHORIZED_ACCOUNT_MESSAGE);
        return;
      }

      router.push(postLoginPath);
      router.refresh();
    } catch {
      setError("Unable to reach the server. Try again later.");
    }
  }

  return (
    <AuthRoleGuard allowedRole="SCHOOL_ADMIN">
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="absolute inset-0 bg-subtle-pattern pointer-events-none" aria-hidden="true" />
        <div className="relative w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-btn mb-4">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-heading text-h2 text-blue-800 mb-1">School admin sign in</h1>
            <p className="font-body text-body text-gray-500">
              Manage your school profile and inquiries
            </p>
          </div>

          <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
            <CardHeader className="pb-0 pt-6 px-6" />
            <CardContent className="px-6 pb-6 space-y-5">
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
                      placeholder="admin@yourschool.com"
                      className={`pl-10 h-11 rounded-xl border font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 transition-colors ${
                        errors.email
                          ? "border-danger-text bg-danger-bg/30"
                          : "border-gray-100 bg-gray-50 focus:bg-white"
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
                        errors.password
                          ? "border-danger-text bg-danger-bg/30"
                          : "border-gray-100 bg-gray-50 focus:bg-white"
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
                    <p className="font-body text-meta text-danger-text">
                      {errors.password.message}
                    </p>
                  )}
                  <div className="flex justify-end pt-1">
                    <Link
                      href="/forgot-password"
                      className="font-body text-meta text-blue-600 hover:text-blue-800"
                    >
                      Forgot password?
                    </Link>
                  </div>
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

              <p className="text-center font-body text-label text-gray-400 pt-1">
                Need to list your school?{" "}
                <Link
                  href={AUTH_ROUTES.schoolRegister}
                  className="text-amber-700 hover:text-amber-800 font-heading font-semibold transition-colors"
                >
                  Register your school
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </AuthRoleGuard>
  );
}
