"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { datasetApi } from "@/lib/api/datasets";
import { Loader2 } from "lucide-react";

type Row = Record<string, unknown>;

const PALETTE = ["#6366f1", "#22d3ee", "#a78bfa", "#34d399", "#f472b6", "#fbbf24"];

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
      <div className="h-64 min-w-[300px] w-full">{children}</div>
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

  const formatValue = (v: unknown): string => {
    if (typeof v === "number") return v.toLocaleString();
    return String(v ?? "");
  };

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
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-5 py-4">
          <p className="text-xs text-slate-400 truncate">{labelKey}: {valueKey}</p>
          <p className="mt-1 text-2xl font-bold text-indigo-300">{formatValue(value)}</p>
        </div>
      </ChartEntrance>
    );
  }

  if (chartType === "tablechart") {
    return (
      <ChartEntrance>
        <div className="max-h-72 overflow-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-900 text-slate-400">
              <tr>
                {keys.map((k) => (
                  <th key={k} className="px-3 py-2 font-medium">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-slate-800/70">
                  {keys.map((k) => (
                    <td key={k} className="px-3 py-2 text-slate-200">{formatValue(row[k])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartEntrance>
    );
  }

  if (chartType === "piechart") {
    const data = rows.map((row, i) => ({
      name: String(row[labelKey] ?? `#${i}`),
      value: Number(row[valueKey]) || 0,
    }));
    return (
      <ChartEntrance>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2">
          <ChartScroller>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius="45%" outerRadius="80%" paddingAngle={2}>
                  {data.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartScroller>
        </div>
      </ChartEntrance>
    );
  }

  const isLine = chartType === "linechart";
  const data = rows.map((row: Row) => ({
    label: String(row[labelKey] ?? ""),
    value: Number(row[valueKey]) || 0,
  }));

  return (
    <ChartEntrance>
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2">
        <ChartScroller>
          <ResponsiveContainer width="100%" height="100%">
            {isLine ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: "#22d3ee" }} />
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </ChartScroller>
      </div>
    </ChartEntrance>
  );
}