"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Stagger, StaggerItem } from "@/components/motion";

const TESTIMONIALS = [
  {
    quote:
      "I used to write SQL for every single question. Now I just type it. The cleaning report alone saves me an hour a week.",
    name: "Maya R.",
    role: "Data Analyst, fintech startup",
  },
  {
    quote:
      "Asked for average revenue by region and got a chart in seconds. My whole ops team uses it now — nobody touches Excel.",
    name: "Daniel K.",
    role: "COO, e-commerce scale-up",
  },
  {
    quote:
      "The AI didn't guess — it planned the query, validated the schema, and only then showed me numbers. That trust is huge.",
    name: "Sofia L.",
    role: "Product Manager, SaaS company",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        eyebrow="Testimonials"
        title="Loved by people who live in spreadsheets"
        subtitle="Real workflows, real shortcuts — from analysts to operators."
      />
      <Stagger className="grid gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <StaggerItem key={t.name} className="h-full">
            <motion.figure
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
            >
              <Quote className="mb-4 h-7 w-7 text-indigo-500/60" />
              <blockquote className="mb-5 flex-1 text-sm leading-relaxed text-slate-300">
                “{t.quote}”
              </blockquote>
              <figcaption className="border-t border-slate-800 pt-4">
                <div className="text-sm font-semibold text-white">{t.name}</div>
                <div className="text-xs text-slate-500">{t.role}</div>
              </figcaption>
            </motion.figure>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
