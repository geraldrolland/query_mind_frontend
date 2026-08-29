"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { apiErrorMessage } from "@/lib/api/client";
import {
  AuthShell,
  ErrorBanner,
  FormField,
  PasswordRequirements,
  PasswordStrength,
  SubmitButton,
} from "@/components/auth/auth-shell";

const FEATURES = [
  { icon: <CheckCircle2 className="h-3 w-3" />, text: "Set a strong new password" },
  { icon: <ArrowRight className="h-3 w-3" />, text: "Back to querying in seconds" },
];

const TESTIMONIAL = {
  quote: "Reset flow was seamless. One click, new password, back to work.",
  name: "Alex T.",
  role: "Engineering Lead, Vercel",
};

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(email, token, password, confirmPassword);
      setSuccess(true);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => {
      router.push("/signin?msg=Password%20reset%20successfully,%20sign%20in");
    }, 3000);
    return () => clearTimeout(t);
  }, [success, router]);

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Enter a new password for your account"
      features={FEATURES}
      testimonial={TESTIMONIAL}
      footer={
        <Link href="/signin" className="font-medium text-indigo-400 transition hover:text-indigo-300">
          Back to sign in
        </Link>
      }
    >
      <ErrorBanner message={error} />
      <AnimatePresence mode="wait">
        {success ? (
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
              <h3 className="mb-1 text-lg font-semibold text-white">Password reset!</h3>
              <p className="text-sm text-slate-400">
                Redirecting to sign in in 3 seconds…
              </p>
            </div>
            <Link
              href="/signin?msg=Password%20reset%20successfully,%20sign%20in"
              className="block w-full rounded-lg bg-indigo-500 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              Sign in now
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
              label="New password"
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
              label="Confirm new password"
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
            <SubmitButton loading={loading}>Reset password</SubmitButton>
          </motion.form>
        )}
      </AnimatePresence>
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
