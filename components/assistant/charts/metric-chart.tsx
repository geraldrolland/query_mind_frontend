
import { formatValue } from "@/lib/utils"

interface MetricChartPropType {
    labelKey: string,
    valueKey: string,
    value: unknown

}

const MetricChart = ({valueKey, labelKey, value}: MetricChartPropType) => {
    return(
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-5 py-4">
        <p className="text-xs text-slate-400 truncate">{labelKey}: {valueKey}</p>
        <p className="mt-1 text-2xl font-bold text-indigo-300">{formatValue(value)}</p>
    </div>
    )
}

export default MetricChart;