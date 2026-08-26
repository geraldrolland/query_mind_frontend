import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {
  CartesianGrid,
  Line,
  LineChart as Chart,
  XAxis,
  YAxis,
} from "recharts";
import { dateGranularity, formatLabel } from "@/lib/utils"


interface LineChartPropType {
    rows: Record<string, unknown>[],
    valueKey: string,
    labelKey: string,
    dsl: Record<string, unknown>
}

const LineChart = ({rows, valueKey, labelKey, dsl}: LineChartPropType) => {
  const granularity = dateGranularity(dsl);
  const data = rows
    .filter(
      (row: {[x: string]: unknown}) =>
        row[labelKey] !== null &&
        row[labelKey] !== undefined &&
        row[labelKey] !== ""
    )
    .map((row: {[x: string]: unknown}) => ({
      label: formatLabel(row[labelKey], granularity),
      value: Number(row[valueKey]) || 0,
    }));
  const seriesConfig: ChartConfig = {
    value: { label: valueKey, color: "var(--color-chart-1)" },
  };
  const chartMinWidth = Math.max(320, data.length * 72);
    return(
        <>
        <ChartContainer config={seriesConfig} className="h-64" style={{ minWidth: chartMinWidth }}>
            <Chart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} tickMargin={6} interval={0} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Line type="monotone" dataKey="value" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 3, fill: "var(--color-chart-2)" }} />
            </Chart>
        </ChartContainer>
        
        </>
    )
}

export default LineChart;