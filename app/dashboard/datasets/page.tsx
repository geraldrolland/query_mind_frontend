"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Database, MessageSquare, Plus, Trash2 } from "lucide-react";
import { useDatasets } from "@/hooks/useDatasets";
import { UploadDatasetModal } from "@/components/datasets/upload-dataset-modal";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import type { Dataset } from "@/lib/types";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DatasetCard({
  dataset,
  onDelete,
}: {
  dataset: Dataset;
  onDelete: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-indigo-500/50"
    >
      <div className="mb-3 flex items-start justify-between">
        <motion.div
          whileHover={{ scale: 1.08, rotate: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/15"
        >
          <Database className="h-5 w-5 text-indigo-400" />
        </motion.div>
        {confirming ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-2"
          >
            <button
              onClick={() => onDelete(dataset.id)}
              className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-300 hover:bg-red-500/30"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-400"
            >
              Cancel
            </button>
          </motion.div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="text-slate-500 hover:text-red-400"
            title="Delete dataset"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <h3 className="mb-1 truncate text-base font-semibold text-white">{dataset.name}</h3>
      {dataset.description && (
        <p className="mb-2 line-clamp-2 text-sm text-slate-400">{dataset.description}</p>
      )}
      <div className="mb-4 mt-auto flex items-center gap-4 text-xs text-slate-500">
        <span>{dataset.total_rows.toLocaleString()} rows</span>
        <span>{formatBytes(dataset.total_size_bytes)}</span>
        <span>{new Date(dataset.created_at).toLocaleDateString()}</span>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/dashboard/datasets/${dataset.id}`}
          className="flex-1 rounded-lg bg-slate-800 px-3 py-2 text-center text-sm font-medium text-slate-200 hover:bg-slate-700"
        >
          Explore
        </Link>
        <Link
          href={`/dashboard/datasets/${dataset.id}/assistant`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Ask AI
        </Link>
      </div>
    </motion.div>
  );
}

export default function DatasetsPage() {
  const { datasets, loading, error, uploading, remove } = useDatasets();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <FadeIn className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Datasets</h1>
          <p className="text-sm text-slate-400">
            Upload CSVs and ask questions about your data.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Upload dataset
        </motion.button>
      </FadeIn>

      {error && (
        <FadeIn className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </FadeIn>
      )}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60"
            />
          ))}
        </div>
      ) : datasets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 py-20 text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.15 }}
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15"
          >
            <Database className="h-7 w-7 text-indigo-400" />
          </motion.div>
          <h2 className="text-lg font-semibold text-slate-300">No datasets yet</h2>
          <p className="mb-6 mt-1 max-w-sm text-sm text-slate-500">
            Upload your first CSV — duplicates are removed automatically and
            missing values are reported.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
          >
            <Plus className="h-4 w-4" />
            Upload your first dataset
          </motion.button>
        </motion.div>
      ) : (
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {datasets.map((d) => (
            <StaggerItem key={d.id} className="h-full">
              <DatasetCard dataset={d} onDelete={(id) => remove(id)} />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {uploading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center"
          >
            <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto" />
            <p className="text-sm text-slate-300">Uploading and cleaning your data…</p>
          </motion.div>
        </motion.div>
      )}

      <UploadDatasetModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
