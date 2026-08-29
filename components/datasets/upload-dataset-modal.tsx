"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { UploadCloud, X, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { datasetApi, persistCleaningReport } from "@/lib/api/datasets";
import { apiErrorMessage } from "@/lib/api/client";
import { CleaningReport } from "@/lib/types";

function CountUp({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 700;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  if (reduce) return <>{value.toLocaleString()}</>;
  return <>{display.toLocaleString()}</>;
}

function formatRows(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return n.toLocaleString();
}

export function CleaningReportCard({ report, datasetId }: { report: CleaningReport; datasetId: string }) {
  const [nullsExpanded, setNullsExpanded] = useState(false);
  const nullColumns = Object.entries(report.null_counts).filter(([, n]) => n > 0);
  const retentionRate = report.raw_rows > 0
    ? ((report.rows_ingested / report.raw_rows) * 100).toFixed(1)
    : "100";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Data Cleaning Report</h3>
        <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
          {retentionRate}% retained
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <motion.div
          className="h-full rounded-full bg-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${retentionRate}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />
      </div>

      {/* Arrow flow */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-200"><CountUp value={report.raw_rows} /></span>
        <span className="text-slate-600">→</span>
        <span className="text-slate-200"><CountUp value={report.rows_ingested} /></span>
        {report.duplicates_removed > 0 && (
          <span className="text-xs text-amber-400">
            ({formatRows(report.duplicates_removed)} dupes removed)
          </span>
        )}
      </div>

      {/* Null values — compact */}
      {nullColumns.length > 0 ? (
        <div className="mt-3">
          <button
            onClick={() => setNullsExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300"
          >
            <AlertTriangle className="h-3 w-3" />
            {nullColumns.length} column{nullColumns.length > 1 ? "s" : ""} with nulls
            {nullsExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
          <AnimatePresence>
            {nullsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {nullColumns.map(([col, count]) => (
                    <span
                      key={col}
                      className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-300"
                    >
                      {col}: {count}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-500">No nulls detected</p>
      )}
    </motion.div>
  );
}

export function UploadDatasetModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<CleaningReport | null>(null);
  const [datasetId, setDatasetId] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Choose a CSV file first");
      return;
    }
    if (!name.trim()) {
      setError("Give the dataset a name");
      return;
    }
    setLoading(true);
    try {
      const res = await datasetApi.upload(file, name.trim(), description.trim() || undefined);
      persistCleaningReport(res.dataset.id, res.cleaning_report);
      setDatasetId(res.dataset.id);
      setReport(res.cleaning_report);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {report ? "Upload complete" : "Upload a CSV"}
              </h2>
              <motion.button
                whileHover={{ rotate: 90 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {report ? (
              <>
                <CleaningReportCard report={report} datasetId={datasetId ?? ""} />
                <div className="mt-5 flex justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onClose}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500"
                  >
                    Close
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => datasetId && router.push(`/dashboard/datasets/${datasetId}`)}
                    disabled={!datasetId}
                    className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
                  >
                    View dataset
                  </motion.button>
                </div>
              </>
            ) : (
              <form onSubmit={onSubmit}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => fileRef.current?.click()}
                  className="mb-4 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-700 py-10 text-slate-400 hover:border-indigo-500 hover:text-indigo-400"
                >
                  <UploadCloud className="h-8 w-8" />
                  <span className="text-sm">
                    {file ? file.name : "Click to choose a .csv file"}
                  </span>
                </motion.button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setFile(f);
                    if (f && !name) setName(f.name.replace(/\.csv$/i, ""));
                  }}
                />
                <label className="mb-4 block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-300">Dataset name</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                  />
                </label>
                <label className="mb-4 block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-300">
                    Description (optional)
                  </span>
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                  />
                </label>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                  >
                    {error}
                  </motion.div>
                )}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={loading}
                  className="w-full rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
                >
                  {loading ? "Uploading & cleaning…" : "Upload and clean"}
                </motion.button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
