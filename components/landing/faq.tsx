"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "@/components/motion";

const FAQS = [
  {
    q: "What file types can I upload?",
    a: "CSV files for now. Upload, and QueryMind automatically removes duplicate rows and reports missing values per column before you ever ask a question.",
  },
  {
    q: "Do I need to know SQL or Python?",
    a: "No. Questions are asked in plain English — the assistant plans, validates, and runs the query for you. The SQL (or DSL) is handled behind the scenes.",
  },
  {
    q: "How do I know the answers are correct?",
    a: "Every answer is produced by executing a real query against your data, and the query plan is validated against your schema first. Results show actual computed values, not guesses.",
  },
  {
    q: "What kinds of questions can I ask?",
    a: "Anything expressible as a query: summaries, aggregates by category, top-N rankings, trends over time, missing-value checks, and more. Complex natural language gets converted into a structured plan.",
  },
  {
    q: "Can I visualize the results?",
    a: "Yes — each answer comes with one-click charts: bar, line, pie, and metric views. Charts re-execute against the dataset so they always reflect the validated plan.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Sessions use HTTP-only cookies with CSRF protection. The backend is the source of truth for authorization — your data is never shared.",
  },
];

function FaqItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-slate-100 sm:text-base">{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 text-slate-400"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-6 py-24">
      <SectionHeading
        eyebrow="FAQ"
        title="Questions, answered"
        subtitle="Everything you might want to know before uploading your first CSV."
      />
      <Reveal className="space-y-3">
        {FAQS.map((f, i) => (
          <FaqItem
            key={f.q}
            q={f.q}
            a={f.a}
            open={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? null : i)}
          />
        ))}
      </Reveal>
    </section>
  );
}
