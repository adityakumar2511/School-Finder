"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getAdminApiBase } from "@/lib/admin-auth";
import { UNAUTHORIZED_ACCOUNT_MESSAGE } from "@/lib/auth-config";

const adminLoginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AdminLoginForm = z.infer<typeof adminLoginSchema>;

/**
 * Hidden administrator sign-in — direct URL only (/admin-login).
 * Authenticates via backend JWT API, then syncs NextAuth session for app guards.
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginForm>({ resolver: zodResolver(adminLoginSchema) });

  async function onSubmit(data: AdminLoginForm) {
    setError(null);

    try {
      const res = await fetch(`${getAdminApiBase()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          expectedRole: "ADMIN",
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (res.status === 403) {
        setError(body.message ?? UNAUTHORIZED_ACCOUNT_MESSAGE);
        return;
      }

      if (!res.ok) {
        setError(body.message ?? "Sign in failed. Check your credentials.");
        return;
      }

      if (!body.token) {
        setError("Sign in failed. No session token received.");
        return;
      }

      const sessionRes = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: body.token }),
      });

      if (!sessionRes.ok) {
        setError("Sign in failed. Could not persist session.");
        return;
      }

      const nextAuthResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        authContext: "admin",
        redirect: false,
      });

      if (nextAuthResult?.error) {
        setError(UNAUTHORIZED_ACCOUNT_MESSAGE);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Unable to reach the server. Try again later.");
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 mb-4">
            <Shield className="w-6 h-6 text-slate-200" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white tracking-tight">
            Administrator access
          </h1>
          <p className="font-body text-sm text-slate-400 mt-2">
            Restricted sign-in for authorized personnel only
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 shadow-2xl rounded-2xl backdrop-blur-sm">
          <CardHeader className="pb-2 pt-6 px-6" />
          <CardContent className="px-6 pb-6">
            {error && (
              <div className="mb-4 rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3">
                <p className="font-body text-sm text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-300 font-heading text-sm">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@organization.com"
                  className={`h-11 rounded-lg bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-slate-500 ${
                    errors.email ? "border-red-800" : ""
                  }`}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-300 font-heading text-sm">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`h-11 pr-10 rounded-lg bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-slate-500 ${
                      errors.password ? "border-red-800" : ""
                    }`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 mt-2 rounded-lg bg-slate-100 text-slate-900 hover:bg-white font-heading font-semibold"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
