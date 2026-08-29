import { useMemo } from "react";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {
  CartesianGrid,
  Line,
  LineChart as Chart,
  XAxis,
  YAxis,
} from "recharts";
import { checkComparisonData, formatLabel, CHART_COLORS } from "@/lib/utils"

interface LineChartPropType {
    rows: Record<string, unknown>[],
    valueKey: string,
    labelKey: string,
}

const LineChart = ({rows, valueKey, labelKey}: LineChartPropType) => {
  const isComparison = useMemo(() => checkComparisonData(rows[0]), [rows]);

  const data = useMemo(() => {
    const filtered = rows.filter(
      (row: {[x: string]: unknown}) =>
        row[labelKey] !== null &&
        row[labelKey] !== undefined &&
        row[labelKey] !== ""
    );

    if (isComparison) {
      return filtered.map((row: {[x: string]: unknown}) => ({
        ...row,
        [labelKey]: formatLabel(row[labelKey], labelKey),
      }));
    }
    return filtered.map((row: {[x: string]: unknown}) => ({
      label: formatLabel(row[labelKey], labelKey),
      value: Number(row[valueKey]) || 0,
    }));
  }, [rows, labelKey, valueKey, isComparison]);

  const seriesConfig = useMemo((): ChartConfig => {
    if (isComparison) {
      const config: ChartConfig = {};
      const comparisonFields = Object.keys(rows[0]).filter((key) => key !== labelKey);
      for (let i = 0; i < comparisonFields.length; i++) {
        config[comparisonFields[i]] = {
          label: comparisonFields[i],
          color: CHART_COLORS[i % CHART_COLORS.length]
        }
      }
      return config;
    }
    return {
      value: { label: valueKey, color: "var(--color-chart-1)" },
    };
  }, [isComparison, rows, labelKey, valueKey]);

  const chartMinWidth = Math.max(320, data.length * 72);

  return(
    <ChartContainer config={seriesConfig} className="h-64" style={{ minWidth: chartMinWidth }}>
      <Chart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey={isComparison ? labelKey : "label"} stroke="#64748b" fontSize={11} tickLine={false} tickMargin={6} interval={0} padding={{ right: 30 }} />
        <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        {
          isComparison
            ? Object.keys(rows[0]).filter((key) => key !== labelKey).map((key, i) =>
                <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 3, fill: CHART_COLORS[(i + 1) % CHART_COLORS.length] }} />
              )
            : <Line type="monotone" dataKey="value" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 3, fill: "var(--color-chart-2)" }} />
        }
      </Chart>
    </ChartContainer>
  )
}

export default LineChart;
