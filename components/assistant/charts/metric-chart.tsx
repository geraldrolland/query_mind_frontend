import { formatValue } from "@/lib/utils"

interface MetricChartPropType {
    valueKey: string,
    value: unknown
}

function formatFieldName(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const MetricChart = ({ valueKey, value }: MetricChartPropType) => {
    return(
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-5 py-4">
            <p className="text-xs text-slate-400 truncate">{formatFieldName(valueKey)}</p>
            <p className="mt-1 text-2xl font-bold text-indigo-300">{formatValue(value)}</p>
        </div>
    )
}

export default MetricChart;
