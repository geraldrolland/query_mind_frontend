import { useMemo } from "react";
import { formatLabel, checkComparisonData, CHART_COLORS } from "@/lib/utils"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {
  BarChart as Chart,
  CartesianGrid,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

interface BarChartPropType {
    rows: Record<string, unknown>[],
    valueKey: string,
    labelKey: string,
}


const BarChart = ({rows, valueKey, labelKey}: BarChartPropType) => {
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
        <XAxis dataKey={isComparison ? labelKey : "label"} stroke="#64748b" fontSize={11} tickLine={false} tickMargin={6} interval={0} />
        <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        {
          isComparison
            ? Object.keys(rows[0]).filter((key) => key !== labelKey).map((key, i) =>
                <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
              )
            : <Bar dataKey="value" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
        }
      </Chart>
    </ChartContainer>
  )
}

export default BarChart;
