"use client"

import { memo } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { formatRows } from "@/lib/utils";

interface HeaderBlockProps {
    datasetName?: string;
    totalRows?: number;
    indicator?: ReactNode;
}

const HeaderBlock = memo(({ datasetName, totalRows, indicator }: HeaderBlockProps) => {
    const params = useParams<{ datasetId: string }>();
    const datasetId = params.datasetId;
    const name = datasetName || "Your Dataset";
    const rows = totalRows ?? 0;

    return (
        <motion.header
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl"
        >
            <div className="flex items-center justify-between gap-3 px-4 py-2 sm:px-6">
                <Link
                    href={`/dashboard/datasets/${datasetId}`}
                    className="group flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
                >
                    <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                    Datasets
                </Link>
                <div className="flex items-center gap-2">
                    {indicator}
                    <span className="rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-400">
                        {formatRows(rows)} rows
                    </span>
                </div>
            </div>
            <div className="px-4 pb-3 sm:px-6">
                <h1 className="flex min-w-0 items-center gap-2 text-lg font-bold text-white">
                    <Sparkles className="h-4 w-4 shrink-0 text-indigo-400" />
                    <span className="truncate">
                        {name ? `${name} — AI Assistant` : "AI Assistant"}
                    </span>
                </h1>
            </div>
        </motion.header>
    );
});

HeaderBlock.displayName = "HeaderBlock";
export default HeaderBlock;
