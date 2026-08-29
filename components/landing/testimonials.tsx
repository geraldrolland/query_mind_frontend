"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Stagger, StaggerItem } from "@/components/motion";

const TESTIMONIALS = [
  {
    quote:
      "I used to write SQL for every single question. Now I just type it. The cleaning report alone saves me an hour a week.",
    name: "Maya R.",
    role: "Data Analyst",
    company: "Stripe",
    initials: "MR",
    stars: 5,
  },
  {
    quote:
      "Asked for average revenue by region and got a chart in seconds. My whole ops team uses it now \u2014 nobody touches Excel.",
    name: "Daniel K.",
    role: "COO",
    company: "Shopify",
    initials: "DK",
    stars: 5,
  },
  {
    quote:
      "The AI didn\u2019t guess \u2014 it planned the query, validated the schema, and only then showed me numbers. That trust is huge.",
    name: "Sofia L.",
    role: "Product Manager",
    company: "Notion",
    initials: "SL",
    stars: 5,
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="mb-3 flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        eyebrow="Testimonials"
        title="Loved by people who live in spreadsheets"
        subtitle="Real workflows, real shortcuts \u2014 from analysts to operators."
      />
      <Stagger className="grid gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <StaggerItem key={t.name} className="h-full">
            <motion.figure
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
            >
              <StarRating count={t.stars} />
              <blockquote className="mb-5 flex-1 text-sm leading-relaxed text-slate-300">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="border-t border-slate-800 pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-slate-500">
                      {t.role}, <span className="text-slate-400">{t.company}</span>
                    </div>
                  </div>
                </div>
              </figcaption>
            </motion.figure>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
