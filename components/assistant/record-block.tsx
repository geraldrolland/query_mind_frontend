"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { datasetApi } from "@/lib/api/datasets";
import { Loader2 } from "lucide-react";
import MetricChart from "./charts/metric-chart";
import TableChart from "./charts/table-chart";
import PieChart from "./charts/pie-chart";
import BarChart from "./charts/bar-chart";
import LineChart from "./charts/line-chart";

type Row = Record<string, unknown>;

const colorFor = (i: number) => `var(--color-chart-${(i % 5) + 1})`;



function ChartScroller({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <div className="w-full">{children}</div>
    </div>
  );
}

interface RecordBlockProps {
  datasetId: string;
  dsl: Record<string, unknown>;
  chartType: string;
}

export function RecordBlock({ datasetId, dsl, chartType }: RecordBlockProps) {
  const [state, setState] = useState<{
    rows: Row[] | null;
    error: string | null;
    key: string;
  }>({ rows: null, error: null, key: "" });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const key = JSON.stringify(dsl);

  useEffect(() => {
    let cancelled = false;
    datasetApi
      .query(datasetId, dsl)
      .then((res) => {
        if (!cancelled) setState({ rows: res.data ?? [], error: null, key });
      })
      .catch((err) => {
        if (!cancelled) {
          const detail = err?.response?.data?.detail;
          const message = Array.isArray(detail)
            ? detail.map((d: { msg?: string }) => d?.msg ?? JSON.stringify(d)).join("; ")
            : detail ?? "Could not load chart data.";
          setState({ rows: null, error: String(message), key });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [datasetId, dsl, key]);

  useEffect(() => {
    if (!expandedId) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpandedId(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [expandedId]);

  useEffect(() => {
    if (expandedId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [expandedId]);

  const rows = state.key === key ? state.rows : null;
  const error = state.key === key ? state.error : null;

  const keys = useMemo(() => {
    if (!rows || rows.length === 0) return [];
    return Object.keys(rows[0]);
  }, [rows]);

  const { labelKey, valueKey } = useMemo(() => {
    const numeric = keys.filter((k) => typeof rows?.[0]?.[k] === "number");
    const label = keys.find((k) => typeof rows?.[0]?.[k] !== "number");
    return { labelKey: label ?? keys[0], valueKey: numeric[0] ?? keys[keys.length - 1] };
  }, [keys, rows]);

  const renderChart = useCallback((type: string, isModal: boolean) => {
    if (!rows) return null;

    if (type === "metricchart") {
      const value = rows[0]?.[valueKey];
      return <MetricChart valueKey={valueKey} labelKey={labelKey} value={value} />;
    }

    if (type === "tablechart") {
      return <TableChart rows={rows} labelKey={labelKey} keys={keys} />;
    }

    if (type === "piechart") {
      return (
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2">
          <ChartScroller>
            <PieChart rows={rows} labelKey={labelKey} valueKey={valueKey} colorFor={colorFor} />
          </ChartScroller>
        </div>
      );
    }

    if (type === "linechart") {
      return (
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2">
          <ChartScroller>
            <LineChart rows={rows} valueKey={valueKey} labelKey={labelKey} />
          </ChartScroller>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2">
        <ChartScroller>
          <BarChart rows={rows} valueKey={valueKey} labelKey={labelKey} />
        </ChartScroller>
      </div>
    );
  }, [rows, keys, labelKey, valueKey]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
        {error}
      </div>
    );
  }

  if (!rows) {
    return (
      <div className="flex items-center gap-2 px-2 py-4 text-xs text-slate-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
        Loading chart…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-6 text-center text-xs text-slate-400">
        No data returned for this query.
      </div>
    );
  }

  return (
    <>
      <motion.div
        layoutId={`chart-${chartType}-${key}`}
        onDoubleClick={() => setExpandedId(chartType)}
        className="cursor-pointer rounded-xl"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          layout: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
          default: { duration: 0.4, ease: "easeOut" },
        }}
      >
        {renderChart(chartType, false)}
      </motion.div>

      <AnimatePresence>
        {expandedId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setExpandedId(null)}
          >
            <motion.div
              layoutId={`chart-${expandedId}-${key}`}
              className="relative max-h-[85vh] max-w-[90vw] rounded-2xl border border-slate-800 bg-slate-950 p-4"
              transition={{
                layout: { type: "spring", stiffness: 300, damping: 30 },
              }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <button
                onClick={() => setExpandedId(null)}
                className="absolute right-3 top-3 z-10 rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-400 hover:bg-slate-700 hover:text-white"
              >
                ✕
              </button>
              {renderChart(expandedId, true)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
