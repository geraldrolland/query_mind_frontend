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
    body: "Drop in a CSV. QueryMind removes duplicates, reports missing values, and builds a schema \u2014 ready in seconds.",
    color: "border-indigo-500/40 bg-indigo-500/15 shadow-indigo-950/50",
    iconColor: "text-indigo-400",
    badge: "bg-indigo-500",
  },
  {
    icon: MessageSquareText,
    step: "02",
    title: "Ask in plain English",
    body: "Type a question like you\u2019d ask a colleague. The assistant plans, validates, and runs a structured query against your data.",
    color: "border-cyan-500/40 bg-cyan-500/15 shadow-cyan-950/50",
    iconColor: "text-cyan-400",
    badge: "bg-cyan-500",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Get answers, visually",
    body: "Results arrive as clean tables with one-click charts \u2014 real numbers you can trust and explore.",
    color: "border-emerald-500/40 bg-emerald-500/15 shadow-emerald-950/50",
    iconColor: "text-emerald-400",
    badge: "bg-emerald-500",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <SectionHeading
        eyebrow="How it works"
        title="From CSV to insight in three steps"
        subtitle="No SQL, no dashboards to configure \u2014 just your data and your questions."
      />
      <Stagger className="relative grid gap-10 md:grid-cols-3 md:gap-6">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <StaggerItem key={s.step} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-4">
                  {i > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.2 + i * 0.15 }}
                      className="hidden md:block"
                    >
                      <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
                        <motion.path
                          d="M0 12h32M26 4l8 8-8 8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-slate-700"
                          initial={{ pathLength: 0 }}
                          whileInView={{ pathLength: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.3 + i * 0.2, ease: "easeInOut" }}
                        />
                      </svg>
                    </motion.div>
                  )}
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.15 + i * 0.1 }}
                    className={`relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border shadow-lg ${s.color}`}
                  >
                    <Icon className={`h-7 w-7 ${s.iconColor}`} />
                    <motion.span
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.4 + i * 0.15 }}
                      className={`absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full ${s.badge} text-xs font-bold text-white`}
                    >
                      {s.step}
                    </motion.span>
                  </motion.div>
                </div>
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.4 }}
                  className="mb-6 md:hidden"
                >
                  <ArrowDown className="h-5 w-5 text-indigo-400/70" />
                </motion.div>
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
