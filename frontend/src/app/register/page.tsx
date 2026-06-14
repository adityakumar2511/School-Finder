"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import AuthRoleGuard from "@/components/auth/AuthRoleGuard";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { PasswordInput } from "@/components/shared/ui/PasswordInput";
import { Label } from "@/components/shared/ui/label";
import { Card, CardContent, CardHeader } from "@/components/shared/ui/card";
import { getAdminApiBase } from "@/lib/auth/admin-auth";
import { AUTH_ROUTES } from "@/lib/auth/auth-config";

const parentRegisterSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required"),
    email: z.string().trim().email("Enter a valid email address"),
    phone: z.string().trim(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (!data.phone) return true;
      return /^[\d\s+\-()]{7,20}$/.test(data.phone);
    },
    { message: "Enter a valid phone number", path: ["phone"] }
  );

type ParentRegisterForm = z.infer<typeof parentRegisterSchema>;

export default function ParentRegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ParentRegisterForm>({ resolver: zodResolver(parentRegisterSchema) });

  async function onSubmit(data: ParentRegisterForm) {
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`${getAdminApiBase()}/api/auth/register-parent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.fullName.trim(),
          email: data.email.trim(),
          phone: data.phone.trim() || undefined,
          password: data.password,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.message ?? "Registration failed. Please try again.");
        return;
      }

      setSuccess(true);

      const signInResult = await signIn("credentials", {
        email: data.email.trim(),
        password: data.password,
        authContext: "parent",
        redirect: false,
      });

      if (signInResult?.error) {
        router.push(AUTH_ROUTES.parentLogin);
        router.refresh();
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Unable to reach the server. Try again later.");
    }
  }

  return (
    <AuthRoleGuard allowedRole="PARENT">
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="absolute inset-0 bg-subtle-pattern pointer-events-none" aria-hidden="true" />
        <div className="relative w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-btn mb-4">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-heading text-h2 text-blue-800 mb-1">Create a parent account</h1>
            <p className="font-body text-body text-gray-500">
              Save schools, send inquiries, and plan for your family
            </p>
          </div>

          <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
            <CardHeader className="pb-0 pt-6 px-6" />
            <CardContent className="px-6 pb-6 space-y-5">
              {success && (
                <div className="alert-success flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success-text shrink-0 mt-0.5" />
                  <p className="font-body text-label">
                    Account created successfully. Signing you in...
                  </p>
                </div>
              )}

              {error && (
                <div className="rounded-xl bg-danger-bg border border-danger-text/20 px-4 py-3">
                  <p className="font-body text-label text-danger-text">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="font-heading text-label text-gray-800">
                    Full name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      placeholder="Jane Smith"
                      className={`pl-10 h-11 rounded-xl border font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 transition-colors ${
                        errors.fullName
                          ? "border-danger-text bg-danger-bg/30"
                          : "border-gray-100 bg-gray-50 focus:bg-white"
                      }`}
                      {...register("fullName")}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="font-body text-meta text-danger-text">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

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
                  <Label htmlFor="phone" className="font-heading text-label text-gray-800">
                    Phone <span className="text-gray-400 font-normal">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+1 555 000 0000"
                      className={`pl-10 h-11 rounded-xl border font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 transition-colors ${
                        errors.phone
                          ? "border-danger-text bg-danger-bg/30"
                          : "border-gray-100 bg-gray-50 focus:bg-white"
                      }`}
                      {...register("phone")}
                    />
                  </div>
                  {errors.phone && (
                    <p className="font-body text-meta text-danger-text">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="font-heading text-label text-gray-800">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <PasswordInput
                      id="password"
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      className={`pl-10 h-11 rounded-xl border font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 transition-colors ${
                        errors.password
                          ? "border-danger-text bg-danger-bg/30"
                          : "border-gray-100 bg-gray-50 focus:bg-white"
                      }`}
                      {...register("password")}
                    />
                  </div>
                  {errors.password && (
                    <p className="font-body text-meta text-danger-text">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="font-heading text-label text-gray-800">
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <PasswordInput
                      id="confirmPassword"
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      className={`pl-10 h-11 rounded-xl border font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 transition-colors ${
                        errors.confirmPassword
                          ? "border-danger-text bg-danger-bg/30"
                          : "border-gray-100 bg-gray-50 focus:bg-white"
                      }`}
                      {...register("confirmPassword")}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="font-body text-meta text-danger-text">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || success}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-heading text-btn rounded-xl shadow-btn transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-center font-body text-label text-gray-400">
                Already have an account?{" "}
                <Link
                  href={AUTH_ROUTES.parentLogin}
                  className="text-blue-600 hover:text-blue-800 font-heading font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>

              <p className="text-center font-body text-meta text-gray-400">
                Listing a school?{" "}
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
