"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Database,
  Loader2,
  LogOut,
  MessageSquare,
  Pause,
  Play,
  Plus,
  SendHorizonal,
  Sparkles,
} from "lucide-react";
import { DEMO_DATASETS, DEMO_PROGRESS, DEMO_QUESTIONS } from "./demo-data";

const PALETTE = ["#6366f1", "#22d3ee", "#a78bfa", "#34d399", "#f472b6", "#fbbf24"];

type View = "grid" | "chat";
type Sub = "type" | "think" | "answer";

const tooltipStyle = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 8,
  fontSize: 12,
};

function DemoChart({ type, rows }: { type: string; rows: Record<string, unknown>[] }) {
  const keys = rows.length ? Object.keys(rows[0]) : [];
  const labelKey = keys.find((k) => typeof rows[0][k] !== "number") ?? keys[0];
  const valueKey = keys.find((k) => typeof rows[0][k] === "number") ?? keys[1];

  if (type === "pie") {
    const data = rows.map((row) => ({
      name: String(row[labelKey]),
      value: Number(row[valueKey]) || 0,
    }));
    return (
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="50%" outerRadius="80%" paddingAngle={2}>
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const data = rows.map((row) => ({
    label: String(row[labelKey] ?? ""),
    value: Number(row[valueKey]) || 0,
  }));

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {type === "line" ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" stroke="#64748b" fontSize={10} tickLine={false} interval="preserveStartEnd" />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} width={44} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: "#22d3ee" }} />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} width={44} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function ChatMessage({
  role,
  children,
  typing,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
  typing?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          role === "user"
            ? "bg-indigo-500 text-white"
            : "border border-slate-800 bg-slate-900/70 text-slate-100"
        }`}
      >
        {typing && (
          <span className="mr-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-caret bg-indigo-300 align-middle" />
        )}
        {children}
      </div>
    </motion.div>
  );
}

export function AnimatedDashboardDemo() {
  const reduce = useReducedMotion();

  const [view, setView] = useState<View>(reduce ? "chat" : "grid");
  const [qIndex, setQIndex] = useState<number>(reduce ? 0 : -1);
  const [sub, setSub] = useState<Sub>(reduce ? "answer" : "type");
  const [typed, setTyped] = useState(0);
  const [progressIdx, setProgressIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const pausedRef = useRef(false);
  const cancelledRef = useRef(false);

  const activeQuestion = qIndex >= 0 ? DEMO_QUESTIONS[qIndex] : null;

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (reduce) return;
    cancelledRef.current = false;
    let active = true;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (cancelledRef.current || !active) return resolve();
          if (pausedRef.current) return setTimeout(tick, 120);
          if (Date.now() - start >= ms) return resolve();
          setTimeout(tick, 60);
        };
        setTimeout(tick, 60);
      });

    (async () => {
      while (active) {
        setView("grid");
        await sleep(3400);
        if (!active) break;
        setView("chat");
        for (let i = 0; i < DEMO_QUESTIONS.length && active; i++) {
          setQIndex(i);
          setTyped(0);
          setSub("type");
          await sleep(2400);
          if (!active) break;
          setProgressIdx(0);
          setSub("think");
          await sleep(2800);
          if (!active) break;
          setSub("answer");
          await sleep(5600);
        }
      }
    })();

    return () => {
      active = false;
      cancelledRef.current = true;
    };
  }, [reduce]);

  useEffect(() => {
    if (!activeQuestion || sub !== "type") return;
    const iv = setInterval(() => {
      if (pausedRef.current) return;
      setTyped((t) => {
        if (t >= activeQuestion.text.length) {
          clearInterval(iv);
          return t;
        }
        return t + 1;
      });
    }, 26);
    return () => clearInterval(iv);
  }, [activeQuestion, sub]);

  useEffect(() => {
    if (sub !== "think") return;
    const iv = setInterval(() => {
      if (pausedRef.current) return;
      setProgressIdx((i) => (i + 1) % DEMO_PROGRESS.length);
    }, 700);
    return () => clearInterval(iv);
  }, [sub, qIndex]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-tr from-indigo-600/20 via-transparent to-cyan-500/20 blur-2xl" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-indigo-950/40"
      >
        <div className="flex items-center gap-3 border-b border-slate-800 bg-slate-900/80 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="mx-auto flex items-center gap-2 rounded-md bg-slate-800/80 px-3 py-1 text-xs text-slate-400">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            app.querymind.ai/dashboard
          </div>
          {!reduce && (
            <button
              onClick={() => setPaused((p) => !p)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 text-slate-300 transition hover:border-indigo-500 hover:text-indigo-300"
              title={paused ? "Play demo" : "Pause demo"}
            >
              {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>

        <div className="flex h-[560px]">
          <aside className="hidden w-52 shrink-0 flex-col border-r border-slate-800 bg-slate-900/60 sm:flex">
            <div className="flex items-center gap-2 px-4 py-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight">QueryMind</span>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-2">
              <div className="flex items-center gap-2.5 rounded-lg bg-indigo-500/15 px-3 py-2 text-sm font-medium text-indigo-300">
                <Database className="h-4 w-4" />
                Datasets
              </div>
              <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-400">
                <MessageSquare className="h-4 w-4" />
                AI Assistant
              </div>
            </nav>
            <div className="border-t border-slate-800 p-4">
              <div className="mb-2 truncate text-xs text-slate-300">you@company.com</div>
              <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-500">
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </div>
            </div>
          </aside>

          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {view === "grid" ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                  className="h-full overflow-y-auto p-6"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">Datasets</h3>
                      <p className="text-xs text-slate-400">Upload CSVs and ask questions about your data.</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white">
                      <Plus className="h-3.5 w-3.5" />
                      Upload dataset
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {DEMO_DATASETS.map((d, i) => (
                      <motion.div
                        key={d.name}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.12, duration: 0.4 }}
                        className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
                      >
                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15">
                          <Database className="h-4.5 w-4.5 text-indigo-400" />
                        </div>
                        <h4 className="mb-1 truncate text-sm font-semibold text-white">{d.name}</h4>
                        <div className="mb-3 flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{d.rows.toLocaleString()} rows</span>
                          <span>{d.size}</span>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 rounded-lg bg-slate-800 px-2 py-1.5 text-center text-xs text-slate-200">
                            Explore
                          </div>
                          <div className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-indigo-500 px-2 py-1.5 text-xs font-medium text-white">
                            <MessageSquare className="h-3 w-3" />
                            Ask AI
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.35 }}
                  className="flex h-full flex-col"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
                    <h3 className="flex items-center gap-2 text-sm font-bold">
                      <Sparkles className="h-4 w-4 text-indigo-400" />
                      AI Assistant
                    </h3>
                    <span className="rounded-full border border-slate-800 px-2.5 py-0.5 text-[11px] text-slate-400">
                      sales-2025.csv · 248,312 rows
                    </span>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                    {qIndex >= 0 &&
                      DEMO_QUESTIONS.slice(0, qIndex + 1).map((q, i) => {
                        const isCurrent = i === qIndex;
                        return (
                          <div key={q.text} className="space-y-4">
                            <ChatMessage role="user">
                              {isCurrent && sub === "type"
                                ? q.text.slice(0, typed)
                                : q.text}
                              {isCurrent && sub === "type" && (
                                <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-caret bg-white align-middle" />
                              )}
                            </ChatMessage>

                            {isCurrent && sub === "think" ? (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                              >
                                <div className="flex w-fit items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs text-slate-400">
                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                                  {DEMO_PROGRESS[progressIdx]}
                                </div>
                              </motion.div>
                            ) : (
                              !isCurrent ||
                                (sub === "answer" && (
                                  <ChatMessage role="assistant">
                                    <div className="space-y-3">
                                      <p className="text-sm leading-relaxed">{q.answer}</p>
                                      <DemoChart type={q.chartType} rows={q.rows} />
                                    </div>
                                  </ChatMessage>
                                ))
                            )}
                          </div>
                        );
                      })}
                  </div>

                  <div className="border-t border-slate-800 px-5 py-3">
                    <div className="flex items-end gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5">
                      <div className="flex-1 text-xs text-slate-500">
                        Ask about your data… (e.g. average revenue by region, top 5)
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white">
                        <SendHorizonal className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
