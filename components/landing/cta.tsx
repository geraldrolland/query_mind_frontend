"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion";

function SparkleParticle({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      className="absolute h-1 w-1 rounded-full bg-indigo-400"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        y: [0, -20, -40],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
}

const SPARKLES = [
  { delay: 0, x: 15, y: 70 },
  { delay: 0.5, x: 85, y: 60 },
  { delay: 1, x: 25, y: 30 },
  { delay: 1.5, x: 75, y: 25 },
  { delay: 2, x: 50, y: 80 },
  { delay: 2.5, x: 10, y: 50 },
  { delay: 3, x: 90, y: 45 },
];

export function Cta() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-600/20 via-slate-900 to-cyan-600/15 px-6 py-16 text-center sm:px-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 animate-orb rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute -bottom-24 right-10 h-56 w-56 animate-float-slow rounded-full bg-cyan-500/15 blur-3xl" />
            {SPARKLES.map((s, i) => (
              <SparkleParticle key={i} {...s} />
            ))}
          </div>

          <div className="relative">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500 shadow-xl shadow-indigo-500/30">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300"
            >
              Free during beta
            </motion.div>
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl">
              Ask your data{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                anything
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              Upload a CSV and get your first answer in minutes &mdash; not days.
              No credit card, no query language.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-500/30 transition hover:bg-indigo-400"
                >
                  Create your free account
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-7 py-3.5 text-base font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
                >
                  Sign in
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
