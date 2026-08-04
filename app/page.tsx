import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">QueryMind</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/signin" className="text-sm text-slate-300 hover:text-white">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        <section className="py-24 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
            <Sparkles className="h-4 w-4" />
            AI-powered data analysis
          </div>
          <h1 className="mx-auto max-w-3xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Ask your data{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              anything
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Upload a CSV. QueryMind cleans it — removing duplicates and reporting
            missing values — then answers your questions in plain English with
            tables and charts.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-400"
            >
              Try it free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/signin"
              className="rounded-lg border border-slate-700 px-6 py-3 text-base font-semibold text-slate-300 hover:border-slate-500"
            >
              Sign in
            </Link>
          </div>
        </section>

        <section className="grid gap-6 pb-24 sm:grid-cols-3">
          {[
            {
              title: "Upload & clean",
              body: "Drop in a CSV. Duplicates are removed automatically and null counts per column are reported.",
            },
            {
              title: "Ask in plain English",
              body: "“Average revenue by region, top 5” — QueryMind turns it into a structured query and runs it.",
            },
            {
              title: "See answers visually",
              body: "Results come back as clean tables with one-click charts, ready to explore.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
            >
              <h3 className="mb-2 text-lg font-semibold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{f.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        QueryMind — insights from your data, instantly.
      </footer>
    </div>
  );
}
