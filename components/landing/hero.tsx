"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, MessageSquareText, BarChart3, Database } from "lucide-react";
import { CountUp } from "./count-up";

const FEATURES = [
  { icon: <Sparkles className="h-5 w-5" />, title: "Clean data automatically", desc: "Duplicates removed, missing values reported" },
  { icon: <MessageSquareText className="h-5 w-5" />, title: "Ask in plain English", desc: "No SQL or formulas needed" },
  { icon: <BarChart3 className="h-5 w-5" />, title: "Instant charts & tables", desc: "Visual answers in one click" },
  { icon: <Database className="h-5 w-5" />, title: "Zero setup required", desc: "Upload CSV and start asking" },
];

const TITLE = ["Ask your data", "anything"];

const STATS = [
  { end: 10, suffix: "M+", label: "rows analyzed" },
  { end: 1, suffix: "-click", label: "chart every answer" },
  { end: 0, suffix: " SQL", label: "needed to ask" },
  { end: 5, prefix: "<", suffix: "s", label: "to first insight" },
];

const TRUSTED = ["Acme Corp", "TechFlow", "DataStack", "InsightBase", "Metricly"];

export function Hero() {
  const reduce = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState(0);

  const { scrollY } = useScroll();
  const orb1Y = useTransform(scrollY, [0, 600], [0, -80]);
  const orb2Y = useTransform(scrollY, [0, 600], [0, -50]);
  const orb3Y = useTransform(scrollY, [0, 600], [0, -30]);

  useEffect(() => {
    if (reduce) return;
    const iv = setInterval(() => {
      setActiveIdx((i) => (i + 1) % FEATURES.length);
    }, 3000);
    return () => clearInterval(iv);
  }, [reduce]);

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(148,163,184,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.4) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
          }}
        />
        <motion.div
          style={{ y: orb1Y }}
          className="absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 animate-orb rounded-full bg-indigo-600/25 blur-3xl"
        />
        <motion.div
          style={{ y: orb2Y }}
          className="absolute top-40 -left-32 h-72 w-72 animate-float-slow rounded-full bg-cyan-500/15 blur-3xl"
        />
        <motion.div
          style={{ y: orb3Y }}
          className="absolute top-24 -right-32 h-80 w-80 animate-float rounded-full bg-violet-600/15 blur-3xl"
        />
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 text-center sm:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300"
        >
          <Sparkles className="h-4 w-4" />
          AI-powered data analysis
        </motion.div>

        <h1 className="mx-auto max-w-3xl text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl">
          {reduce ? (
            <span>
              Ask your data{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                anything
              </span>
            </span>
          ) : (
            TITLE.map((word, wi) => (
              <span key={word} className="inline-block">
                {word.split("").map((ch, ci) => (
                  <motion.span
                    key={ci}
                    initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.5, delay: 0.15 + (wi * TITLE[0].length + ci) * 0.028 }}
                    className={`inline-block ${wi === 1 ? "bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-x" : ""}`}
                  >
                    {ch}
                  </motion.span>
                ))}
                {wi === 0 && <span className="inline-block">&nbsp;</span>}
              </span>
            ))
          )}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-slate-400"
        >
          Upload a CSV. QueryMind cleans it — removing duplicates and reporting
          missing values — then answers your questions in plain English with
          tables and charts.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-500/30 transition hover:bg-indigo-400"
            >
              Try it free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-7 py-3.5 text-base font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Watch the demo
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mx-auto mt-12 h-20 max-w-2xl"
        >
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/5 via-transparent to-cyan-500/5" />
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                  {FEATURES[activeIdx].icon}
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-slate-200">{FEATURES[activeIdx].title}</div>
                  <div className="text-xs text-slate-500">{FEATURES[activeIdx].desc}</div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="mt-3 flex justify-center gap-1.5">
              {FEATURES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === activeIdx ? "w-6 bg-indigo-500" : "w-1.5 bg-slate-700 hover:bg-slate-600"
                  }`}
                  aria-label={`Show feature ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.05 }}
          className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4"
        >
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-extrabold sm:text-3xl">
                <CountUp
                  end={s.end}
                  prefix={s.prefix}
                  suffix={s.suffix}
                  className="bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent"
                />
              </div>
              <div className="mt-1 text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="mx-auto mt-16 max-w-lg"
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-slate-600">
            Trusted by data teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {TRUSTED.map((name) => (
              <span
                key={name}
                className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-400"
              >
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
