"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  AuthShell,
  ErrorBanner,
  FormField,
  GoogleButton,
  SubmitButton,
} from "@/components/auth/auth-shell";

function SignInForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(searchParams.get("msg"));
  const [loading, setLoading] = useState(false);
  const nextPath = searchParams.get("next") || undefined;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password, nextPath);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to query your datasets"
      footer={
        <>
          New to QueryMind?{" "}
          <Link href="/signup" className="text-indigo-400 hover:underline">
            Create an account
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
          placeholder="••••••••"
          autoComplete="current-password"
        />
        <div className="mb-3 text-right text-sm">
          <Link href="/forgot-password" className="text-indigo-400 hover:underline">
            Forgot password?
          </Link>
        </div>
        <SubmitButton loading={loading}>Sign in</SubmitButton>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
        <div className="h-px flex-1 bg-slate-800" />
        OR
        <div className="h-px flex-1 bg-slate-800" />
      </div>
      <GoogleButton />
    </AuthShell>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
