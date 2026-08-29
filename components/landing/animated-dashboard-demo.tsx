"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Database,
  FileText,
  Loader2,
  LogOut,
  MessageSquare,
  Pause,
  Play,
  Plus,
  SendHorizonal,
  Sparkles,
  Table2,
  Upload,
  X,
} from "lucide-react";
import {
  DEMO_ANSWER,
  DEMO_CHART_DATA,
  DEMO_CLEANING_REPORT,
  DEMO_DATASETS,
  DEMO_EXPLORE,
  DEMO_NEW_DATASET,
  DEMO_PROGRESS,
  DEMO_QUERY,
  DEMO_SUGGESTIONS,
  DEMO_UPLOAD_FILE,
} from "./demo-data";

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

/* ───────────────────────── Sidebar ───────────────────────── */

function DemoSidebar({ active }: { active: "datasets" | "assistant" }) {
  return (
    <aside className="hidden w-52 shrink-0 flex-col border-r border-slate-800 bg-slate-900/60 sm:flex">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-bold tracking-tight">QueryMind</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        <div
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${
            active === "datasets"
              ? "bg-indigo-500/15 text-indigo-300"
              : "text-slate-400"
          }`}
        >
          <Database className="h-4 w-4" />
          Datasets
        </div>
        <div
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${
            active === "assistant"
              ? "bg-indigo-500/15 text-indigo-300"
              : "text-slate-400"
          }`}
        >
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
  );
}

/* ───────────────────────── Bar Chart ───────────────────────── */

function DemoBarChart({ expanded }: { expanded?: boolean }) {
  const data = DEMO_CHART_DATA.rows.map((r) => ({
    label: r.region,
    value: r.revenue,
  }));
  const config: ChartConfig = {
    value: { label: "revenue", color: CHART_COLORS[0] },
  };
  return (
    <ChartContainer config={config} className={expanded ? "h-72 w-full" : "h-44 w-full"}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="label" stroke="#64748b" fontSize={10} tickLine={false} padding={{ right: 30 }} />
        <YAxis stroke="#64748b" fontSize={10} tickLine={false} width={44} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="value" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

/* ─────────────────── Screen 1: Dashboard Grid ─────────────────── */

function DashboardGrid({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Datasets</h3>
          <p className="text-xs text-slate-400">Upload CSVs and ask questions about your data.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onUpload}
          className="flex items-center gap-2 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          Upload dataset
        </motion.button>
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
    </div>
  );
}

/* ─────────────────── Screen 2-3: Upload Modal ─────────────────── */

function UploadModal({
  phase,
  onUpload,
  onClose,
}: {
  phase: "form" | "uploading" | "done";
  onUpload: () => void;
  onClose: () => void;
}) {
  const [filename, setFilename] = useState("");
  const typingDone = useRef(false);

  useEffect(() => {
    if (phase !== "form" || typingDone.current) return;
    typingDone.current = true;
    let i = 0;
    const iv = setInterval(() => {
      if (i >= DEMO_UPLOAD_FILE.length) {
        clearInterval(iv);
        return;
      }
      setFilename(DEMO_UPLOAD_FILE.slice(0, i + 1));
      i++;
    }, 40);
    return () => clearInterval(iv);
  }, [phase]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
      >
        {phase === "done" ? (
          <div className="p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              Dataset cleaned
            </div>
            <div className="mb-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-slate-800/60 p-3">
                <div className="text-lg font-bold text-white">
                  {DEMO_CLEANING_REPORT.raw_rows.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500">Raw rows</div>
              </div>
              <div className="rounded-lg bg-slate-800/60 p-3">
                <div className="text-lg font-bold text-white">
                  {DEMO_CLEANING_REPORT.rows_ingested.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500">Ingested</div>
              </div>
              <div className="rounded-lg bg-slate-800/60 p-3">
                <div className="text-lg font-bold text-red-400">
                  -{DEMO_CLEANING_REPORT.duplicates_removed.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500">Duplicates</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-slate-700 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
              >
                View dataset →
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Upload dataset</h3>
              <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            {phase === "form" ? (
              <>
                <div className="mb-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/40 px-6 py-10 text-center transition-colors hover:border-indigo-500/50">
                  <Upload className="mb-2 h-8 w-8 text-slate-500" />
                  <p className="text-sm text-slate-400">Drop your CSV here or click to browse</p>
                  <p className="mt-1 text-xs text-slate-600">.csv files up to 100MB</p>
                </div>
                <label className="mb-4 block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-300">Dataset name</span>
                  <input
                    type="text"
                    value={filename}
                    readOnly
                    placeholder="sales-2026.csv"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                  />
                </label>
                <button
                  onClick={onUpload}
                  disabled={!filename}
                  className="w-full rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400 disabled:opacity-50"
                >
                  Upload and clean
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="mb-3 h-8 w-8 animate-spin text-indigo-400" />
                <p className="text-sm text-slate-400">Uploading and cleaning {DEMO_UPLOAD_FILE}…</p>
                <div className="mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-slate-800">
                  <motion.div
                    className="h-full rounded-full bg-indigo-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────── Screen 4: Explore Page ─────────────────── */

function ExplorePage({ onAskAI }: { onAskAI: () => void }) {
  const stats = DEMO_EXPLORE.stats;
  return (
    <div className="h-full overflow-y-auto p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
        <span className="text-sm text-slate-400 hover:text-white cursor-default">← Datasets</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-white">{DEMO_NEW_DATASET.name}</h1>
          <p className="text-xs text-slate-400">
            {stats.rows.toLocaleString()} rows · created Jul 29, 2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-300">
            <Table2 className="h-3.5 w-3.5" />
            View Schema
          </button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAskAI}
            className="flex items-center gap-2 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-400"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Ask the AI assistant
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {[
          { icon: Database, label: "Rows", value: stats.rows.toLocaleString(), color: "text-indigo-400" },
          { icon: Table2, label: "Columns", value: String(stats.columns), color: "text-indigo-400" },
          { icon: AlertTriangle, label: "Nulls", value: String(stats.nulls), color: "text-amber-400" },
          { icon: FileText, label: "Complete", value: `${stats.completeness}%`, color: "text-emerald-400" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <div className="mb-1 flex items-center gap-2">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-xs text-slate-500">{s.label}</span>
            </div>
            <p className="text-xl font-bold text-white">{s.value}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Sample rows
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900">
                {DEMO_EXPLORE.columns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-400"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEMO_EXPLORE.sampleRows.map((row, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="border-b border-slate-800/50 last:border-0"
                >
                  {DEMO_EXPLORE.columns.map((col) => (
                    <td key={col} className="px-4 py-2.5 text-xs text-slate-300">
                      {row[col as keyof typeof row]}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────── Screen 5-6: Assistant Page ─────────────────── */

function AssistantChat({
  chatPhase,
  typedChars,
  progressIdx,
}: {
  chatPhase: "suggestions" | "typing" | "sending" | "sent" | "thinking" | "streaming" | "answer";
  typedChars: number;
  progressIdx: number;
}) {
  const showUserMessage = ["sending", "sent", "thinking", "streaming", "answer"].includes(chatPhase);
  const showThinking = ["thinking"].includes(chatPhase);
  const showReply = ["streaming", "answer"].includes(chatPhase);
  const showSentCheck = ["sent", "thinking", "streaming", "answer"].includes(chatPhase);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          AI Assistant
        </h3>
        <span className="rounded-full border border-slate-800 px-2.5 py-0.5 text-[11px] text-slate-400">
          {DEMO_NEW_DATASET.name} · {DEMO_EXPLORE.stats.rows.toLocaleString()} rows
        </span>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {chatPhase === "suggestions" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2"
          >
            {DEMO_SUGGESTIONS.map((s, i) => (
              <motion.span
                key={s}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="cursor-default rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400"
              >
                💡 {s}
              </motion.span>
            ))}
          </motion.div>
        )}

        {showUserMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex justify-end"
          >
            <div className="flex items-center gap-2 rounded-2xl bg-indigo-500 px-4 py-3 text-sm text-white">
              {chatPhase === "typing"
                ? DEMO_QUERY.slice(0, typedChars)
                : DEMO_QUERY}
              {chatPhase === "typing" && (
                <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-caret bg-white align-middle" />
              )}
              {showSentCheck && (
                <Check className="h-3.5 w-3.5 text-emerald-300" />
              )}
            </div>
          </motion.div>
        )}

        {showThinking && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-2.5 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
              {DEMO_PROGRESS[progressIdx]}
            </div>
          </motion.div>
        )}

        {showReply && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex justify-start"
          >
            <div className="max-w-[85%] space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-100">
              <p className="leading-relaxed">{DEMO_ANSWER}</p>
              <div className="cursor-pointer rounded-xl transition-opacity hover:opacity-90">
                <DemoBarChart />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="border-t border-slate-800 px-5 py-3">
        <div className="flex items-end gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5">
          <div className="flex-1 text-xs text-slate-500">
            {chatPhase === "typing"
              ? DEMO_QUERY.slice(0, typedChars)
              : chatPhase === "suggestions"
                ? "Ask about your data…"
                : DEMO_QUERY}
            {chatPhase === "typing" && (
              <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-caret bg-indigo-400 align-middle" />
            )}
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white">
            <SendHorizonal className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Screen 7: Chart Modal ─────────────────── */

function ChartModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-400 hover:bg-slate-700 hover:text-white"
        >
          ✕
        </button>
        <h4 className="mb-3 text-sm font-semibold text-slate-300">Average revenue by region</h4>
        <DemoBarChart expanded />
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────── Main Demo Component ─────────────────── */

type Screen = "dashboard" | "explore" | "assistant";
type UploadPhase = "form" | "uploading" | "done";
type ChatPhase = "suggestions" | "typing" | "sending" | "sent" | "thinking" | "streaming" | "answer";

export function AnimatedDashboardDemo() {
  const reduce = useReducedMotion();

  const [screen, setScreen] = useState<Screen>(reduce ? "assistant" : "dashboard");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>(reduce ? "done" : "form");
  const [chatPhase, setChatPhase] = useState<ChatPhase>(reduce ? "answer" : "suggestions");
  const [typedChars, setTypedChars] = useState(0);
  const [progressIdx, setProgressIdx] = useState(0);
  const [chartExpanded, setChartExpanded] = useState(false);
  const [paused, setPaused] = useState(false);

  const pausedRef = useRef(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Main loop
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
        // Screen 1: Dashboard
        setScreen("dashboard");
        setUploadOpen(false);
        setUploadPhase("form");
        await sleep(3000);
        if (!active) break;

        // Open upload modal
        setUploadOpen(true);
        await sleep(500);
        if (!active) break;

        // Screen 2: Upload form (typing already happens in UploadModal)
        await sleep(2800);
        if (!active) break;

        // Screen 3: Uploading
        setUploadPhase("uploading");
        await sleep(1800);
        if (!active) break;

        // Cleaning report
        setUploadPhase("done");
        await sleep(3200);
        if (!active) break;

        // Close modal, stay on dashboard briefly
        setUploadOpen(false);
        await sleep(1200);
        if (!active) break;

        // Screen 4: Explore
        setScreen("explore");
        await sleep(4500);
        if (!active) break;

        // Screen 5: Assistant (suggestions)
        setScreen("assistant");
        setChatPhase("suggestions");
        await sleep(2500);
        if (!active) break;

        // Screen 6: Type query
        setChatPhase("typing");
        setTypedChars(0);
        const typeIv = setInterval(() => {
          if (!pausedRef.current) {
            setTypedChars((n) => {
              if (n >= DEMO_QUERY.length) {
                clearInterval(typeIv);
                return n;
              }
              return n + 1;
            });
          }
        }, 30);
        await sleep(DEMO_QUERY.length * 30 + 400);
        clearInterval(typeIv);
        if (!active) break;

        // Sending
        setChatPhase("sending");
        await sleep(600);
        if (!active) break;

        // Sent
        setChatPhase("sent");
        await sleep(800);
        if (!active) break;

        // Thinking
        setChatPhase("thinking");
        setProgressIdx(0);
        const thinkIv = setInterval(() => {
          if (!pausedRef.current) {
            setProgressIdx((j) => (j + 1) % DEMO_PROGRESS.length);
          }
        }, 600);
        await sleep(2600);
        clearInterval(thinkIv);
        if (!active) break;

        // Streaming reply
        setChatPhase("streaming");
        await sleep(2500);
        if (!active) break;

        // Full answer
        setChatPhase("answer");
        await sleep(2000);
        if (!active) break;

        // Screen 7: Chart modal
        setChartExpanded(true);
        await sleep(3500);
        if (!active) break;

        // Close modal
        setChartExpanded(false);
        await sleep(800);
      }
    })();

    return () => {
      active = false;
      cancelledRef.current = true;
    };
  }, [reduce]);

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
        {/* Browser chrome */}
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

        {/* Main content */}
        <div className="flex h-[560px]">
          <DemoSidebar active={screen === "assistant" ? "assistant" : "datasets"} />

          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {screen === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <DashboardGrid onUpload={() => setUploadOpen(true)} />
                </motion.div>
              )}

              {screen === "explore" && (
                <motion.div
                  key="explore"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <ExplorePage onAskAI={() => setScreen("assistant")} />
                </motion.div>
              )}

              {screen === "assistant" && (
                <motion.div
                  key="assistant"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <AssistantChat
                    chatPhase={chatPhase}
                    typedChars={typedChars}
                    progressIdx={progressIdx}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload modal overlay */}
            <AnimatePresence>
              {uploadOpen && (
                <UploadModal
                  phase={uploadPhase}
                  onUpload={() => setUploadPhase("uploading")}
                  onClose={() => {
                    setUploadOpen(false);
                    setUploadPhase("form");
                  }}
                />
              )}
            </AnimatePresence>

            {/* Chart expansion modal */}
            <AnimatePresence>
              {chartExpanded && (
                <ChartModal onClose={() => setChartExpanded(false)} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
