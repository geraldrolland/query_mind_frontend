"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Database, FileText, MessageSquare, Table2, AlertTriangle, Hash, X, Check, Copy } from "lucide-react";
import { datasetApi, readCleaningReport } from "@/lib/api/datasets";
import { apiErrorMessage } from "@/lib/api/client";
import { CleaningReportCard } from "@/components/datasets/upload-dataset-modal";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import type { CleaningReport, Dataset, DatasetProfile, RecordsResponse } from "@/lib/types";

function formatRows(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return n.toLocaleString();
}

export default function DatasetDetailPage() {
  const params = useParams<{ datasetId: string }>();
  const datasetId = params.datasetId;

  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [schema, setSchema] = useState<Record<string, { type: string; allowed_operators: string[] }> | null>(null);
  const [profile, setProfile] = useState<DatasetProfile | null>(null);
  const [records, setRecords] = useState<RecordsResponse | null>(null);
  const [cleaningReport, setCleaningReport] = useState<CleaningReport | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoadedFor, setProfileLoadedFor] = useState<string | null>(null);
  const [schemaOpen, setSchemaOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  const profileLoading = profileLoadedFor !== datasetId;

  useEffect(() => {
    let ignore = false;
    Promise.all([
      datasetApi.get(datasetId),
      datasetApi.schema(datasetId),
      datasetApi.records(datasetId, page, 20),
    ])
      .then(([d, s, r]) => {
        if (ignore) return;
        setDataset(d);
        setSchema(s.schema);
        localStorage.setItem(`qm:schema:${datasetId}`, JSON.stringify(s.schema));
        setRecords(r);
        setCleaningReport(readCleaningReport(datasetId));
      })
      .catch((err) => {
        if (!ignore) setError(apiErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [datasetId, page]);

  useEffect(() => {
    let ignore = false;
    datasetApi
      .profile(datasetId)
      .then((p) => {
        if (!ignore) {
          setProfile(p);
          setProfileLoadedFor(datasetId);
        }
      })
      .catch(() => {
        if (!ignore) {
          setProfile(null);
          setProfileLoadedFor(datasetId);
        }
      });
    return () => {
      ignore = true;
    };
  }, [datasetId]);

  useEffect(() => {
    if (!schemaOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSchemaOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [schemaOpen]);

  useEffect(() => {
    if (schemaOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [schemaOpen]);

  if (loading && !dataset) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-2 h-4 w-24 animate-pulse rounded bg-slate-800" />
        <div className="mb-4 h-8 w-1/2 animate-pulse rounded bg-slate-800 sm:w-1/3" />
        <div className="mb-6 h-4 w-48 animate-pulse rounded bg-slate-800" />
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      </div>
    );
  }

  const columns = records?.records.length ? Object.keys(records.records[0].data) : schema ? Object.keys(schema) : [];
  const totalNulls = profile?.columns.reduce((sum, col) => sum + col.nulls, 0) ?? 0;
  const totalCells = (profile?.row_count ?? 0) * (profile?.columns.length ?? 0);
  const completeness = totalCells > 0 ? ((1 - totalNulls / totalCells) * 100).toFixed(1) : "100";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <FadeIn>
        <Link
          href="/dashboard/datasets"
          className="group mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Datasets
        </Link>
      </FadeIn>

      <FadeIn className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-white">{dataset?.name}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {formatRows(dataset?.total_rows ?? 0)} rows · created{" "}
            {dataset ? new Date(dataset.created_at).toLocaleDateString() : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSchemaOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
          >
            <Table2 className="h-4 w-4" />
            View Schema
          </motion.button>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={`/dashboard/datasets/${datasetId}/assistant`}
              className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
            >
              <MessageSquare className="h-4 w-4" />
              Ask the AI assistant
            </Link>
          </motion.div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <div className="mb-1 flex items-center gap-2">
              <Database className="h-4 w-4 text-indigo-400" />
              <span className="text-xs text-slate-500">Rows</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatRows(dataset?.total_rows ?? 0)}</p>
          </motion.div>
          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <div className="mb-1 flex items-center gap-2">
              <Table2 className="h-4 w-4 text-indigo-400" />
              <span className="text-xs text-slate-500">Columns</span>
            </div>
            <p className="text-2xl font-bold text-white">{profile?.columns.length ?? schema ? Object.keys(schema!).length : "—"}</p>
          </motion.div>
          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <div className="mb-1 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-slate-500">Nulls</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatRows(totalNulls)}</p>
          </motion.div>
          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <div className="mb-1 flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-slate-500">Complete</span>
            </div>
            <p className="text-2xl font-bold text-white">{completeness}%</p>
          </motion.div>
        </div>
      </FadeIn>

      <Stagger className="space-y-6" amount={0.05}>
        <StaggerItem>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Sample rows
            </h2>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900">
                    {columns.map((col, i) => (
                      <th
                        key={col}
                        className={`px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-400 ${
                          i === 0 ? "sticky left-0 z-10 bg-slate-900" : ""
                        }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {records?.records.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRow(selectedRow === row.id ? null : row.id)}
                      className={`cursor-pointer transition-colors ${
                        selectedRow === row.id
                          ? "bg-indigo-500/10"
                          : "bg-slate-900/20 hover:bg-slate-800/40"
                      }`}
                    >
                      {columns.map((col, ci) => {
                        const cellKey = `${row.id}-${col}`;
                        const isCopied = copiedCell === cellKey;
                        const value = row.data[col];
                        const display = value == null ? null : String(value);
                        return (
                          <td
                            key={col}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (display) {
                                navigator.clipboard.writeText(display);
                                setCopiedCell(cellKey);
                                setTimeout(() => setCopiedCell(null), 1500);
                              }
                            }}
                            className={`group relative max-w-48 px-4 py-2.5 ${
                              ci === 0
                                ? "sticky left-0 z-10 border-r border-slate-800 bg-slate-900 font-medium text-slate-200"
                                : "text-slate-300"
                            }`}
                          >
                            {display ? (
                              <span className="flex items-center gap-1.5 truncate">
                                <span className="truncate">{display}</span>
                                <span className="hidden shrink-0 group-hover:inline-flex">
                                  {isCopied ? (
                                    <Check className="h-3 w-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3 w-3 text-slate-500" />
                                  )}
                                </span>
                              </span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {records && records.total > 0 && (
              <div className="mt-3 flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-center sm:text-left">
                  Page {records.page} of {Math.max(1, Math.ceil(records.total / records.page_size))}
                  {" "}· {formatRows(records.total)} rows total
                </span>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 transition-colors hover:border-slate-700 hover:text-white disabled:opacity-40"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </motion.button>
                  <span className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
                    {records.page}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * 20 >= records.total}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 transition-colors hover:border-slate-700 hover:text-white disabled:opacity-40"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </motion.button>
                </div>
              </div>
            )}
          </StaggerItem>

          {cleaningReport && (
            <StaggerItem>
              <CleaningReportCard report={cleaningReport} datasetId="" />
            </StaggerItem>
          )}
      </Stagger>

      {/* Schema slide-out panel */}
      <AnimatePresence>
        {schemaOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSchemaOpen(false)}
              className="fixed inset-0 z-40 bg-black/60"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 right-0 z-50 w-96 overflow-y-auto border-l border-slate-800 bg-slate-900"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
                <h2 className="text-sm font-semibold text-white">Schema & Stats</h2>
                <button
                  onClick={() => setSchemaOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-6 p-4">
                {/* Column Stats */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/60">
                  <div className="border-b border-slate-800 px-4 py-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Column Stats</span>
                      {profile && <span>{profile.columns.length} columns</span>}
                    </div>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {profileLoading ? (
                      <>
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-12 animate-pulse px-4" />
                        ))}
                      </>
                    ) : (
                      profile?.columns.map((col, i) => (
                        <motion.div
                          key={col.name}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.03 + i * 0.02, duration: 0.3 }}
                          className="px-4 py-2.5 transition-colors hover:bg-slate-800/40"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="truncate text-sm font-medium text-slate-200">{col.name}</span>
                              <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-xs text-indigo-300">
                                {col.type}
                              </span>
                              {col.nulls > 0 && (
                                <span className="flex items-center gap-1 text-xs text-amber-400">
                                  <AlertTriangle className="h-3 w-3" />
                                  {col.nulls}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-0.5 text-xs text-slate-500">
                            {col.type === "number" && col.min != null && (
                              <span>{String(col.min)} → {String(col.max)} · avg {col.avg}</span>
                            )}
                            {col.type === "date" && col.min != null && (
                              <span>{String(col.min).slice(0, 10)} → {String(col.max).slice(0, 10)}</span>
                            )}
                            {col.type === "string" && col.top_values && col.top_values.length > 0 && (
                              <span className="truncate">top: {col.top_values.slice(0, 3).join(", ")}</span>
                            )}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* Schema */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/60">
                  <div className="border-b border-slate-800 px-4 py-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Schema</span>
                      {schema && <span>{Object.keys(schema).length} columns</span>}
                    </div>
                  </div>
                  {schema && (
                    <div className="divide-y divide-slate-800">
                      {Object.entries(schema).map(([name, rule], i) => (
                        <motion.div
                          key={name}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.03 + i * 0.02, duration: 0.3 }}
                          className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-slate-800/40"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Hash className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                            <span className="truncate text-sm font-medium text-slate-200">{name}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-xs text-indigo-300">
                              {rule.type}
                            </span>
                            <span className="hidden text-xs text-slate-600 sm:inline">
                              {rule.allowed_operators.length} ops
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
