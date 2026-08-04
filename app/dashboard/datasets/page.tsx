"use client";

import { useState } from "react";
import Link from "next/link";
import { Database, MessageSquare, Plus, Trash2 } from "lucide-react";
import { useDatasets } from "@/hooks/useDatasets";
import { UploadDatasetModal } from "@/components/datasets/upload-dataset-modal";
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
    <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-indigo-500/50">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/15">
          <Database className="h-5 w-5 text-indigo-400" />
        </div>
        {confirming ? (
          <div className="flex gap-2">
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
          </div>
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
    </div>
  );
}

export default function DatasetsPage() {
  const { datasets, loading, error, uploading, remove } = useDatasets();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Datasets</h1>
          <p className="text-sm text-slate-400">
            Upload CSVs and ask questions about your data.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
        >
          <Plus className="h-4 w-4" />
          Upload dataset
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
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
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 py-20 text-center">
          <Database className="mb-4 h-12 w-12 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-300">No datasets yet</h2>
          <p className="mb-6 mt-1 max-w-sm text-sm text-slate-500">
            Upload your first CSV — duplicates are removed automatically and
            missing values are reported.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
          >
            <Plus className="h-4 w-4" />
            Upload your first dataset
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {datasets.map((d) => (
            <DatasetCard key={d.id} dataset={d} onDelete={(id) => remove(id)} />
          ))}
        </div>
      )}

      {uploading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center">
            <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto" />
            <p className="text-sm text-slate-300">Uploading and cleaning your data…</p>
          </div>
        </div>
      )}

      <UploadDatasetModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
