"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  DatabaseZap,
  FileCheck2,
  MessageSquareText,
  ShieldCheck,
  Table2,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Stagger, StaggerItem } from "@/components/motion";

const FEATURES = [
  {
    icon: DatabaseZap,
    title: "Upload & auto-clean",
    body: "Drop in a CSV. Duplicates are removed automatically and null counts per column are reported — no spreadsheet cleanup required.",
    accent: "from-indigo-500/20 to-indigo-500/0",
  },
  {
    icon: MessageSquareText,
    title: "Ask in plain English",
    body: "“Average revenue by region, top 5” — QueryMind turns natural language into a validated, structured query and runs it on your data.",
    accent: "from-cyan-500/20 to-cyan-500/0",
  },
  {
    icon: Table2,
    title: "Answers as tables",
    body: "Every result comes back as a clean table with real computed values — never a hallucinated number.",
    accent: "from-violet-500/20 to-violet-500/0",
  },
  {
    icon: BarChart3,
    title: "One-click charts",
    body: "Turn any result into a bar, line, pie, or metric chart instantly. Charts stay live against the latest data.",
    accent: "from-emerald-500/20 to-emerald-500/0",
  },
  {
    icon: FileCheck2,
    title: "Cleaning report",
    body: "See exactly what happened: raw rows, rows kept, duplicates removed, and per-column null counts in one glance.",
    accent: "from-amber-500/20 to-amber-500/0",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    body: "Session-based auth with CSRF protection and Google sign-in. Your data stays yours — the backend is the source of truth.",
    accent: "from-pink-500/20 to-pink-500/0",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <SectionHeading
        eyebrow="Features"
        title="Everything you need to understand your data"
        subtitle="From messy CSV to insight in seconds — cleaning, querying, and visualization without code."
      />
      <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <StaggerItem key={f.title}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative h-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                />
                <div className="relative">
                  <motion.div
                    whileHover={{ rotate: -8, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 12 }}
                    className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15"
                  >
                    <Icon className="h-5.5 w-5.5 text-indigo-400" />
                  </motion.div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{f.body}</p>
                </div>
              </motion.div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}
