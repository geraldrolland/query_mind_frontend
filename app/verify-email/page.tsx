"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, Mail, RefreshCw } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { apiErrorMessage } from "@/lib/api/client";
import { AuthShell, ErrorBanner } from "@/components/auth/auth-shell";

const FEATURES = [
  { icon: <Mail className="h-3 w-3" />, text: "One last step to full access" },
  { icon: <CheckCircle2 className="h-3 w-3" />, text: "Unlock all features" },
];

const TESTIMONIALS = [
  {
    quote: "Verification was instant. Signed up, verified, and had my first chart in under a minute.",
    name: "Chris M.",
    role: "Founder, DataLoop",
  },
  {
    quote: "Smooth onboarding. The whole process felt effortless from start to finish.",
    name: "Rachel K.",
    role: "Analytics Lead, Airbnb",
  },
];

function VerifyEmailPageContent() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"loading" | "ok" | "error">("error");
  const [message, setMessage] = useState<string | null>(
    "Missing verification token. Request a new link below."
  );
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get("email") || "";
    const t = params.get("token") || "";
    setEmail(e);
    setToken(t);

    if (!t) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    let ignore = false;
    authApi
      .verifyEmail(e, t)
      .then(() => {
        if (!ignore) setStatus("ok");
      })
      .catch((err) => {
        if (!ignore) {
          setStatus("error");
          setMessage(apiErrorMessage(err));
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <AuthShell
      title="Verify your email"
      subtitle={
        status === "ok"
          ? "Your email is verified — you can sign in now."
          : "Confirm your email address to continue"
      }
      features={FEATURES}
      testimonials={TESTIMONIALS}
      footer={
        <Link href="/signin" className="font-medium text-indigo-400 transition hover:text-indigo-300">
          Go to sign in
        </Link>
      }
    >
      <AnimatePresence mode="wait">
        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-8"
          >
            <div className="relative mb-4">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border border-indigo-500/30" />
            </div>
            <p className="text-sm text-slate-400">Verifying your email…</p>
          </motion.div>
        )}

        {status === "ok" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col items-center py-4 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20"
            >
              <CheckCircle2 className="h-7 w-7 text-emerald-400" />
            </motion.div>
            <h3 className="mb-1 text-lg font-semibold text-white">Email verified!</h3>
            <p className="mb-4 text-sm text-slate-400">
              Your account is ready. Start querying your data.
            </p>
            <Link
              href="/signin"
              className="block w-full rounded-lg bg-indigo-500 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              Sign in
            </Link>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <ErrorBanner message={message} />
            <motion.button
              type="button"
              disabled={resending}
              onClick={async () => {
                setMessage(null);
                setResending(true);
                try {
                  await authApi.requestVerifyEmail(email);
                  setMessage("A new verification link was sent. Check your inbox.");
                } catch (err) {
                  setMessage(apiErrorMessage(err));
                } finally {
                  setResending(false);
                }
              }}
              whileHover={!resending ? { scale: 1.01 } : undefined}
              whileTap={!resending ? { scale: 0.98 } : undefined}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:from-indigo-400 hover:to-indigo-500 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Resend verification link
                </>
              )}
            </motion.button>
            <p className="text-center text-xs text-slate-500">
              Didn&apos;t receive it? Check your spam folder.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailPageContent />
    </Suspense>
  );
}
