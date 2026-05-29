import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 font-body text-gray-900">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-card">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-h2 text-blue-800">Forgot password</h1>
          <p className="mt-2 font-body text-body text-gray-500">
            Enter your email and we will send you a reset link if the account exists.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
