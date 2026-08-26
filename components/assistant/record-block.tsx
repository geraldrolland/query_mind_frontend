"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { datasetApi } from "@/lib/api/datasets";
import { Loader2 } from "lucide-react";
import MetricChart from "./charts/metric-chart";
import TableChart from "./charts/table-chart";
import PieChart from "./charts/pie-chart";
import BarChart from "./charts/bar-chart";
import LineChart from "./charts/line-chart";

type Row = Record<string, unknown>;

const colorFor = (i: number) => `var(--color-chart-${(i % 5) + 1})`;



function ChartEntrance({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

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

  if (chartType === "metricchart") {
    const value = rows[0]?.[valueKey];
    return (
      <ChartEntrance>
        <MetricChart valueKey={valueKey} labelKey={labelKey} value={value} />
      </ChartEntrance>
    );
  }

  if (chartType === "tablechart") {
    return (
      <ChartEntrance>
        <TableChart dsl={dsl} rows={rows} labelKey={labelKey} keys={keys} />
      </ChartEntrance>
    );
  }

  if (chartType === "piechart") {
    return (
      <ChartEntrance>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2">
          <ChartScroller>
            <PieChart rows={rows} labelKey={labelKey} valueKey={valueKey} colorFor={colorFor} />
          </ChartScroller>
        </div>
      </ChartEntrance>
    );
  }

  if (chartType === "linechart") {
    return (
      <ChartEntrance>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2">
          <ChartScroller>
            <LineChart rows={rows} valueKey={valueKey} labelKey={labelKey} dsl={dsl} />
          </ChartScroller>
        </div>
      </ChartEntrance>
    );
  }

  else {
    return (
      <ChartEntrance>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2">
          <ChartScroller>
            <BarChart rows={rows} valueKey={valueKey} labelKey={labelKey} dsl={dsl} />
          </ChartScroller>
        </div>
      </ChartEntrance>
    );
  }
}