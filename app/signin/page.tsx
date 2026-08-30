"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { Database, MessageSquareText, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  AuthShell,
  ErrorBanner,
  FormField,
  SubmitButton,
} from "@/components/auth/auth-shell";

const FEATURES = [
  { icon: <Database className="h-3 w-3" />, text: "Access all your datasets" },
  { icon: <MessageSquareText className="h-3 w-3" />, text: "Continue where you left off" },
  { icon: <ShieldCheck className="h-3 w-3" />, text: "Your data stays secure" },
];

const TESTIMONIALS = [
  {
    quote: "The cleaning report alone saves me an hour a week. Now I just type my question and get a chart.",
    name: "Maya R.",
    role: "Data Analyst, Stripe",
  },
  {
    quote: "I stopped waiting on the data team. QueryMind gives me answers in seconds, not days.",
    name: "James L.",
    role: "Product Manager, Notion",
  },
  {
    quote: "Our whole team uses it now. The charts are presentation-ready from the start.",
    name: "Priya S.",
    role: "Growth Lead, Vercel",
  },
];

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
      features={FEATURES}
      testimonials={TESTIMONIALS}
      footer={
        <span>
          New to QueryMind?{" "}
          <Link href="/signup" className="font-medium text-indigo-400 transition hover:text-indigo-300">
            Create an account
          </Link>
        </span>
      }
    >
      <ErrorBanner message={error} />
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
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
          <Link href="/forgot-password" className="text-indigo-400 transition hover:text-indigo-300">
            Forgot password?
          </Link>
        </div>
        <SubmitButton loading={loading}>Sign in</SubmitButton>
      </motion.form>
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
