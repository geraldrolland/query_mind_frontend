"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { apiErrorMessage } from "@/lib/api/client";
import { AuthShell, ErrorBanner } from "@/components/auth/auth-shell";

function VerifyEmailPageContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"loading" | "ok" | "error">(
    token ? "loading" : "error"
  );
  const [message, setMessage] = useState<string | null>(
    token ? null : "Missing verification token. Request a new link below."
  );

  useEffect(() => {
    if (!token) return;
    let ignore = false;
    authApi
      .verifyEmail(email, token)
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
  }, [email, token]);

  return (
    <AuthShell
      title="Verify your email"
      subtitle={
        status === "ok"
          ? "Your email is verified — you can sign in now."
          : "Confirm your email address to continue"
      }
      footer={
        <Link href="/signin" className="text-indigo-400 hover:underline">
          Go to sign in
        </Link>
      }
    >
      {status === "loading" && (
        <p className="text-sm text-slate-400">Verifying your email…</p>
      )}
      <ErrorBanner message={status === "error" ? message : null} />
      {status === "ok" && (
        <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          Success! Email verified.{" "}
          <Link href="/signin" className="underline">
            Sign in
          </Link>
        </div>
      )}
      {status === "error" && (
        <button
          onClick={async () => {
            setMessage(null);
            try {
              await authApi.requestVerifyEmail(email);
              setMessage("A new verification link was sent. Check the server logs in development.");
            } catch (err) {
              setMessage(apiErrorMessage(err));
            }
          }}
          className="mt-2 w-full rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
        >
          Resend verification link
        </button>
      )}
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
