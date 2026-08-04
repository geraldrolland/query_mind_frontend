"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";
import { apiErrorMessage } from "@/lib/api/client";
import {
  AuthShell,
  ErrorBanner,
  FormField,
  SubmitButton,
} from "@/components/auth/auth-shell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await authApi.requestReset(email);
      setMessage("If that email exists, a reset link has been sent. Check the server logs in development.");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a link to set a new password"
      footer={
        <Link href="/signin" className="text-indigo-400 hover:underline">
          Back to sign in
        </Link>
      }
    >
      <ErrorBanner message={error} />
      {message && (
        <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {message}
        </div>
      )}
      <form onSubmit={onSubmit}>
        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <SubmitButton loading={loading}>Send reset link</SubmitButton>
      </form>
    </AuthShell>
  );
}
