"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { CountUp } from "./count-up";

const PHRASES = [
  "average revenue by region",
  "top customers this quarter",
  "monthly signups in 2025",
  "which plan converts best",
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
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [chars, setChars] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const { scrollY } = useScroll();
  const orb1Y = useTransform(scrollY, [0, 600], [0, -80]);
  const orb2Y = useTransform(scrollY, [0, 600], [0, -50]);
  const orb3Y = useTransform(scrollY, [0, 600], [0, -30]);

  useEffect(() => {
    if (reduce) return;
    const phrase = PHRASES[phraseIdx];
    const delay = deleting ? 28 : 55;
    const iv = setInterval(() => {
      setChars((c) => {
        if (!deleting && c >= phrase.length) {
          clearInterval(iv);
          setTimeout(() => setDeleting(true), 1800);
          return c;
        }
        if (deleting && c <= 0) {
          clearInterval(iv);
          setDeleting(false);
          setPhraseIdx((i) => (i + 1) % PHRASES.length);
          return c;
        }
        return deleting ? c - 1 : c + 1;
      });
    }, delay);
    return () => clearInterval(iv);
  }, [phraseIdx, deleting, reduce]);

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
          className="mx-auto mt-12 max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {PHRASES.map((p, i) => (
              <span key={p} className="flex items-center gap-2 text-sm text-slate-400">
                <span className="hidden h-4 w-4 items-center justify-center rounded-md bg-indigo-500/15 text-[10px] font-bold text-indigo-300 sm:flex">
                  {i + 1}
                </span>
                <span className="font-mono text-xs">
                  &ldquo;{reduce ? p : p.slice(0, chars)}&rdquo;
                  {i === phraseIdx && !reduce && (
                    <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-caret bg-indigo-400 align-middle" />
                  )}
                </span>
              </span>
            ))}
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
