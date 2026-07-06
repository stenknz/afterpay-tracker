import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-sm text-center space-y-4">
      <h1 className="text-2xl font-bold">Reset Password</h1>
      <p className="text-neutral-500">Password reset is not yet available. Please contact support for assistance.</p>
      <Link
        href="/login"
        className="inline-block px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors text-sm"
      >
        Back to Login
      </Link>
    </div>
  );
}
