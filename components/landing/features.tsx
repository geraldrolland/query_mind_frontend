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
    color: "from-indigo-500/20 to-indigo-500/0",
    iconBg: "bg-indigo-500/15",
    iconColor: "text-indigo-400",
    glow: "hover:shadow-indigo-500/20",
  },
  {
    icon: MessageSquareText,
    title: "Ask in plain English",
    body: "\u201CAverage revenue by region, top 5\u201D \u2014 QueryMind turns natural language into a validated, structured query and runs it on your data.",
    color: "from-cyan-500/20 to-cyan-500/0",
    iconBg: "bg-cyan-500/15",
    iconColor: "text-cyan-400",
    glow: "hover:shadow-cyan-500/20",
  },
  {
    icon: Table2,
    title: "Answers as tables",
    body: "Every result comes back as a clean table with real computed values \u2014 never a hallucinated number.",
    color: "from-violet-500/20 to-violet-500/0",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-400",
    glow: "hover:shadow-violet-500/20",
  },
  {
    icon: BarChart3,
    title: "One-click charts",
    body: "Turn any result into a bar, line, pie, or metric chart instantly. Comparison charts show multiple metrics side by side.",
    color: "from-emerald-500/20 to-emerald-500/0",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    glow: "hover:shadow-emerald-500/20",
  },
  {
    icon: FileCheck2,
    title: "Cleaning report",
    body: "See exactly what happened: raw rows, rows kept, duplicates removed, and per-column null counts in one glance.",
    color: "from-amber-500/20 to-amber-500/0",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
    glow: "hover:shadow-amber-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    body: "Session-based auth with CSRF protection. Your data stays yours \u2014 the backend is the source of truth.",
    color: "from-pink-500/20 to-pink-500/0",
    iconBg: "bg-pink-500/15",
    iconColor: "text-pink-400",
    glow: "hover:shadow-pink-500/20",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <SectionHeading
        eyebrow="Features"
        title="Everything you need to understand your data"
        subtitle="From messy CSV to insight in seconds \u2014 cleaning, querying, and visualization without code."
      />
      <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <StaggerItem key={f.title}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`group relative h-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-transparent transition-shadow duration-300 ${f.glow}`}
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                />
                <div className="relative">
                  <motion.div
                    whileHover={{ rotate: -8, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 12 }}
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${f.iconBg}`}
                  >
                    <Icon className={`h-5.5 w-5.5 ${f.iconColor}`} />
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
