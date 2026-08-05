"use client";

import { motion } from "framer-motion";
import {
  Building2,
  GraduationCap,
  LineChart,
  Users,
  Check,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Stagger, StaggerItem } from "@/components/motion";

const PERSONAS = [
  {
    icon: LineChart,
    title: "Data analysts",
    body: "Answer ad-hoc questions without writing a new query every time — then export the chart straight into your report.",
    points: ["Instant ad-hoc analysis", "Chart-ready outputs", "Repeatable questions"],
  },
  {
    icon: Building2,
    title: "Founders & operations",
    body: "Check the numbers behind decisions in seconds — no waiting on SQL tickets or spreadsheet archaeology.",
    points: ["Answers in under 5s", "No technical skills needed", "Keep everyone in sync"],
  },
  {
    icon: GraduationCap,
    title: "Students & researchers",
    body: "Turn raw CSV exports into clean, queryable datasets and explore hypotheses without touching a query language.",
    points: ["Cleaning included", "Plain-English queries", "Great for theses"],
  },
  {
    icon: Users,
    title: "Product managers",
    body: "Get from raw event exports to launch metrics fast, and ask follow-up questions as the conversation evolves.",
    points: ["Self-serve analytics", "Trend & cohort questions", "Share insights easily"],
  },
];

export function WhoIsThisFor() {
  return (
    <section id="who-its-for" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <SectionHeading
        eyebrow="Who it's for"
        title="Built for anyone who asks questions about data"
        subtitle="If you have a CSV and a question, QueryMind speaks your language."
      />
      <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PERSONAS.map((p) => {
          const Icon = p.icon;
          return (
            <StaggerItem key={p.title} className="h-full">
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-950/50">
                  <Icon className="h-5.5 w-5.5" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{p.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-slate-400">{p.body}</p>
                <ul className="mt-auto space-y-2">
                  {p.points.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}
