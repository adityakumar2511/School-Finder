import { redirect } from "next/navigation";

type Props = {
  searchParams: { role?: string };
};

/** Legacy token-based reset page — redirects to the OTP flow. */
export default function ResetPasswordRedirectPage({ searchParams }: Props) {
  const role = searchParams.role === "SCHOOL_ADMIN" ? "SCHOOL_ADMIN" : "PARENT";
  redirect(`/forgot-password?role=${role}`);
}
