"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, Mail, ShieldCheck } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { apiErrorMessage } from "@/lib/api/client";
import {
  AuthShell,
  ErrorBanner,
  FormField,
  SubmitButton,
} from "@/components/auth/auth-shell";

const FEATURES = [
  { icon: <Clock className="h-3 w-3" />, text: "Quick recovery in minutes" },
  { icon: <ShieldCheck className="h-3 w-3" />, text: "Secure, one-time link" },
  { icon: <Mail className="h-3 w-3" />, text: "Sent to your inbox" },
];

const TESTIMONIALS = [
  {
    quote: "Reset my password in under a minute. The email came instantly and I was back to querying.",
    name: "Sofia L.",
    role: "Product Manager, Notion",
  },
  {
    quote: "Fast, simple, and no hassle. Exactly what you want from a password reset flow.",
    name: "Alex T.",
    role: "Data Engineer, Stripe",
  },
];

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
      setMessage(
        "If that email exists, a reset link has been sent. Check your inbox (and spam folder)."
      );
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
      features={FEATURES}
      testimonials={TESTIMONIALS}
      footer={
        <Link href="/signin" className="font-medium text-indigo-400 transition hover:text-indigo-300">
          Back to sign in
        </Link>
      }
    >
      <ErrorBanner message={error} />
      <AnimatePresence mode="wait">
        {message ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="flex flex-col items-center py-4 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20"
              >
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </motion.div>
              <h3 className="mb-1 text-lg font-semibold text-white">Check your email</h3>
              <p className="text-sm text-slate-400">{message}</p>
            </div>
            <Link
              href="/signin"
              className="block w-full rounded-lg border border-slate-700 py-2.5 text-center text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              Back to sign in
            </Link>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
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
            <SubmitButton loading={loading}>Send reset link</SubmitButton>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
