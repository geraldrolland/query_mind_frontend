import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion";

export function Cta() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-600/20 via-slate-900 to-cyan-600/15 px-6 py-16 text-center sm:px-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 animate-orb rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute -bottom-24 right-10 h-56 w-56 animate-float-slow rounded-full bg-cyan-500/15 blur-3xl" />
          </div>

          <div className="relative">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500 shadow-xl shadow-indigo-500/30">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl">
              Ask your data{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                anything
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              Upload a CSV and get your first answer in minutes — not days.
              No credit card, no query language.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-500/30 transition hover:bg-indigo-400"
              >
                Create your free account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/signin"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-7 py-3.5 text-base font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
