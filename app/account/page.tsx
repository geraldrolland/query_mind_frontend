"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { useAuth } from "@/hooks/useAuth";

function AccountRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useAuth();
  const [msg] = useState(searchParams.get("msg"));

  useEffect(() => {
    if (status === "authed") {
      router.replace("/dashboard/datasets");
    } else if (status === "anonymous") {
      router.replace("/signin");
    }
  }, [status, router]);

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
