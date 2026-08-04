"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { apiErrorMessage } from "@/lib/api/client";
import {
  AuthShell,
  ErrorBanner,
  FormField,
  SubmitButton,
} from "@/components/auth/auth-shell";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("Missing reset token. Use the link from your email.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(email, token, password, confirmPassword);
      router.push("/signin?msg=Password reset successfully, sign in");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Enter a new password for your account"
      footer={
        <Link href="/signin" className="text-indigo-400 hover:underline">
          Back to sign in
        </Link>
      }
    >
      <ErrorBanner message={error} />
      <form onSubmit={onSubmit}>
        <FormField
          label="New password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        <FormField
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
        />
        <SubmitButton loading={loading}>Reset password</SubmitButton>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
