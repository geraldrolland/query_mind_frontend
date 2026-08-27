"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  AuthShell,
  ErrorBanner,
  FormField,
  // GoogleButton,
  SubmitButton,
} from "@/components/auth/auth-shell";

export default function SignUpPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await register(email, password, confirmPassword);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start asking your data questions in minutes"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/signin" className="text-indigo-400 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <ErrorBanner message={error} />
      <form onSubmit={onSubmit}>
        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <FormField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="8+ chars, upper, lower, number, symbol"
          autoComplete="new-password"
        />
        <FormField
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Repeat password"
          autoComplete="new-password"
        />
        <SubmitButton loading={loading}>Create account</SubmitButton>
      </form>
      {/* <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
        <div className="h-px flex-1 bg-slate-800" />
        OR
        <div className="h-px flex-1 bg-slate-800" />
      </div>
      <GoogleButton /> */}
    </AuthShell>
  );
}
