"use client";

import { motion } from "framer-motion";
import { ArrowDown, MessageSquareText, UploadCloud, BarChart3 } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Stagger, StaggerItem } from "@/components/motion";

const STEPS = [
  {
    icon: UploadCloud,
    step: "01",
    title: "Upload & clean",
    body: "Drop in a CSV. QueryMind removes duplicates, reports missing values, and builds a schema — ready in seconds.",
  },
  {
    icon: MessageSquareText,
    step: "02",
    title: "Ask in plain English",
    body: "Type a question like you'd ask a colleague. The assistant plans, validates, and runs a structured query against your data.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Get answers, visually",
    body: "Results arrive as clean tables with one-click charts — real numbers you can trust and explore.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <SectionHeading
        eyebrow="How it works"
        title="From CSV to insight in three steps"
        subtitle="No SQL, no dashboards to configure — just your data and your questions."
      />
      <Stagger className="relative grid gap-10 md:grid-cols-3 md:gap-6">
        <div className="pointer-events-none absolute top-10 right-[16%] left-[16%] hidden border-t-2 border-dashed border-slate-700/70 md:block" />
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <StaggerItem key={s.step} className="relative">
              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.15 + i * 0.1 }}
                  className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/40 bg-indigo-500/15 shadow-lg shadow-indigo-950/50"
                >
                  <Icon className="h-7 w-7 text-indigo-400" />
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                    {s.step}
                  </span>
                </motion.div>
                {i < STEPS.length - 1 && (
                  <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.4 }}
                    className="mb-6 md:hidden"
                  >
                    <ArrowDown className="h-5 w-5 text-indigo-400/70" />
                  </motion.div>
                )}
                <h3 className="mb-2 text-lg font-semibold text-white">{s.title}</h3>
                <p className="max-w-xs text-sm leading-relaxed text-slate-400">{s.body}</p>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}
