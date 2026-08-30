"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart3, DatabaseZap, Sparkles, Table2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  AuthShell,
  ErrorBanner,
  FormField,
  PasswordRequirements,
  PasswordStrength,
  SubmitButton,
} from "@/components/auth/auth-shell";

const FEATURES = [
  { icon: <Sparkles className="h-3 w-3" />, text: "No credit card required" },
  { icon: <DatabaseZap className="h-3 w-3" />, text: "Unlimited dataset uploads" },
  { icon: <BarChart3 className="h-3 w-3" />, text: "AI-powered insights instantly" },
];

const TESTIMONIALS = [
  {
    quote: "I signed up in 30 seconds, uploaded a CSV, and had my first chart. No setup, no config.",
    name: "Daniel K.",
    role: "COO, Shopify",
  },
  {
    quote: "The best data tool I've used. Clean, fast, and the charts look incredible.",
    name: "Aisha M.",
    role: "Head of Analytics, Figma",
  },
  {
    quote: "Finally, a tool that lets me focus on the question, not the query language.",
    name: "Tom W.",
    role: "Founder, Linear",
  },
];

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
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
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
      features={FEATURES}
      testimonials={TESTIMONIALS}
      footer={
        <span>
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-indigo-400 transition hover:text-indigo-300">
            Sign in
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
          placeholder="8+ chars, upper, lower, number, symbol"
          autoComplete="new-password"
        />
        {password.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.2 }}
          >
            <PasswordStrength password={password} />
            <PasswordRequirements password={password} />
          </motion.div>
        )}
        <FormField
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Repeat password"
          autoComplete="new-password"
          error={confirmPassword.length > 0 && password !== confirmPassword}
        />
        {confirmPassword.length > 0 && password !== confirmPassword && (
          <p className="-mt-2 mb-4 text-xs text-red-400">Passwords do not match</p>
        )}
        <SubmitButton loading={loading}>Create account</SubmitButton>
      </motion.form>
    </AuthShell>
  );
}
