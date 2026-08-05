"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { authApi } from "@/lib/api/auth";
import { useAuth } from "@/hooks/useAuth";

function getNextDestination(): string {
  const stored = sessionStorage.getItem("qm_next");
  sessionStorage.removeItem("qm_next");
  if (stored && stored.startsWith("/") && !stored.startsWith("/signin")) return stored;
  return "/dashboard/datasets";
}

function AccountRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status, refresh } = useAuth();
  const [msg] = useState(searchParams.get("msg"));
  const exchanged = useRef(false);

  useEffect(() => {
    const sessionToken = searchParams.get("session");
    const next = getNextDestination();

    // Google OAuth lands here with a single-use session code. Exchange it for
    // session cookies (set on a same-site JSON response, so browsers store
    // them) before trusting the auth status.
    if (sessionToken && !exchanged.current) {
      exchanged.current = true;
      authApi
        .exchangeSession(sessionToken)
        .then(() => refresh())
        .then((ok) => {
          router.replace(ok ? next : "/signin?msg=google session expired");
        })
        .catch(async () => {
          const ok = await refresh();
          router.replace(ok ? next : "/signin?msg=google session expired");
        });
      return;
    }

    if (status === "authed" && !exchanged.current) {
      router.replace(next);
    } else if (status === "anonymous" && !exchanged.current) {
      router.replace("/signin");
    }
  }, [status, searchParams, router, refresh]);

  return (
    <AuthShell
      title="Completing sign in"
      subtitle="You'll be redirected in a moment."
      footer={null}
    >
      <p className="text-sm text-slate-400">
        {msg === "google authentication success"
          ? "Google sign-in successful."
          : "Finishing authentication…"}
      </p>
    </AuthShell>
  );
}

export default function AccountPage() {
  return (
    <Suspense>
      <AccountRedirect />
    </Suspense>
  );
}
