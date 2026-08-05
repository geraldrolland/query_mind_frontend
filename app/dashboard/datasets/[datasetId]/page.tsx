"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { datasetApi, readCleaningReport } from "@/lib/api/datasets";
import { apiErrorMessage } from "@/lib/api/client";
import { CleaningReportCard } from "@/components/datasets/upload-dataset-modal";
import { FadeIn, Reveal, Stagger, StaggerItem } from "@/components/motion";
import type { CleaningReport, Dataset, DatasetProfile, RecordsResponse } from "@/lib/types";

function SchemaTable({ schema }: { schema: Record<string, { type: string; allowed_operators: string[] }> }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900 text-xs uppercase text-slate-400">
          <tr>
            <th className="px-4 py-3">Column</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Operators</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {Object.entries(schema).map(([name, rule]) => (
            <tr key={name} className="bg-slate-900/40">
              <td className="px-4 py-2.5 font-medium text-slate-200">{name}</td>
              <td className="px-4 py-2.5">
                <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs text-indigo-300">
                  {rule.type}
                </span>
              </td>
              <td className="px-4 py-2.5 text-xs text-slate-400">
                {rule.allowed_operators.join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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

  if (loading && !dataset) {
    return (
      <div className="p-8">
        <div className="mb-6 h-8 w-1/3 animate-pulse rounded bg-slate-800" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="h-64 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60" />
          </div>
          <div className="space-y-6">
            <div className="h-40 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60" />
            <div className="h-40 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60" />
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      </div>
    );
  }

  const columns = records?.records.length ? Object.keys(records.records[0].data) : schema ? Object.keys(schema) : [];

  return (
    <div className="p-8">
      <FadeIn className="mb-6 flex items-start justify-between">
        <div>
          <Link
            href="/dashboard/datasets"
            className="mb-2 flex items-center gap-1 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Datasets
          </Link>
          <h1 className="text-2xl font-bold">{dataset?.name}</h1>
          <p className="text-sm text-slate-400">
            {dataset?.total_rows.toLocaleString()} rows · created{" "}
            {dataset ? new Date(dataset.created_at).toLocaleDateString() : ""}
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link
            href={`/dashboard/datasets/${datasetId}/assistant`}
            className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
          >
            <MessageSquare className="h-4 w-4" />
            Ask the AI assistant
          </Link>
        </motion.div>
      </FadeIn>

      <Stagger className="grid gap-6 lg:grid-cols-3" amount={0.05}>
        <div className="space-y-6 lg:col-span-2">
          {cleaningReport && (
            <StaggerItem>
              <CleaningReportCard report={cleaningReport} datasetId="" />
            </StaggerItem>
          )}

          <StaggerItem>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Sample rows
            </h2>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900 text-xs uppercase text-slate-400">
                  <tr>
                    {columns.map((col) => (
                      <th key={col} className="px-3 py-3">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {records?.records.map((row, ri) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + ri * 0.04, duration: 0.3 }}
                      className="bg-slate-900/40"
                    >
                      {columns.map((col) => (
                        <td key={col} className="max-w-48 truncate px-3 py-2 text-slate-300">
                          {row.data[col] == null ? <span className="text-slate-600">∅</span> : String(row.data[col])}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {records && records.total > 0 && (
              <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                <span>
                  Page {records.page} of {Math.max(1, Math.ceil(records.total / records.page_size))}
                  {" "}· {records.total.toLocaleString()} rows total
                </span>
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded bg-slate-800 px-3 py-1.5 text-xs disabled:opacity-40"
                  >
                    Prev
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * 20 >= records.total}
                    className="rounded bg-slate-800 px-3 py-1.5 text-xs disabled:opacity-40"
                  >
                    Next
                  </motion.button>
                </div>
              </div>
            )}
          </StaggerItem>
        </div>

        <div className="space-y-6">
          <StaggerItem>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Column stats
            </h2>
            <div className="space-y-3">
              {profileLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60"
                    />
                  ))}
                </>
              ) : (
                profile?.columns.map((col) => (
                <motion.div
                  key={col.name}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08, duration: 0.35 }}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-200">{col.name}</span>
                    <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-xs text-indigo-300">
                      {col.type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {col.type === "number" && col.min != null && (
                      <span>
                        min {String(col.min)} · max {String(col.max)} · avg {col.avg}
                      </span>
                    )}
                    {col.type === "date" && col.min != null && (
                      <span>
                        {String(col.min).slice(0, 10)} → {String(col.max).slice(0, 10)}
                      </span>
                    )}
                    {col.type === "string" && col.top_values && (
                      <span>top: {col.top_values.slice(0, 3).join(", ")}</span>
                    )}
                    {col.nulls > 0 && <span className="text-amber-400"> · {col.nulls} nulls</span>}
                  </div>
                </motion.div>
                ))
              )}
            </div>
          </StaggerItem>

          <StaggerItem>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Schema
            </h2>
            {schema && (
              <Reveal y={12}>
                <SchemaTable schema={schema} />
              </Reveal>
            )}
          </StaggerItem>
        </div>
      </Stagger>
    </div>
  );
}
