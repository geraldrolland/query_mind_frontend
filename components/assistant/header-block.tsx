"use client"

import { useParams } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface HeaderBlockProps {
    datasetName?: string;
    totalRows?: number;
    indicator?: ReactNode;
}

const HeaderBlock = ({ datasetName, totalRows, indicator }: HeaderBlockProps) => {
    const params = useParams<{ datasetId: string }>();
    const datasetId = params.datasetId
    const name = datasetName || "Your Dataset";
    const rows = totalRows ?? 0;

    return(
        <>
      <header className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <Link
            href={`/dashboard/datasets/${datasetId}`}
            className="mb-0.5 flex items-center gap-1 text-xs text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" /> Datasets
          </Link>
          <h1 className="flex min-w-0 items-center gap-2 text-lg font-bold">
            <Sparkles className="h-4 w-4 shrink-0 text-indigo-400" />
            <span className="truncate">
              {name ? `${name} — AI Assistant` : "AI Assistant"}
            </span>
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {indicator}
          <span className="rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-400">
            {rows.toLocaleString()} rows
          </span>
        </div>
      </header>
        </>
    )
}
export default HeaderBlock;
