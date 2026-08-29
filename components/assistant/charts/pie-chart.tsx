
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Pie, PieChart as Chart, Cell} from "recharts"

interface PieChartPropType {
    rows: Record<string, unknown>[],
    labelKey: string,
    valueKey: string
    colorFor: ((i: number) => string)
}

const PieChart = ({rows, labelKey, valueKey, colorFor}: PieChartPropType) => {
    const pieData = rows
      .filter(
        (row) =>
          row[labelKey] !== null &&
          row[labelKey] !== undefined &&
          row[labelKey] !== ""
      )
      .map((row, i) => ({
        name: String(row[labelKey] ?? `#${i}`),
        value: Number(row[valueKey]) || 0,
        fill: colorFor(i),
      }));
    const pieConfig: ChartConfig = Object.fromEntries(
      pieData.map((d) => [d.name, { label: d.name, color: d.fill }])
    );
    return(
        <>
            <ChartContainer config={pieConfig} className="h-64 min-w-[300px]">
              <Chart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius="80%" paddingAngle={2}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ stroke: "#64748b", strokeWidth: 1 }}
                >
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              </Chart>
            </ChartContainer>
        </>
    )
}

export default PieChart;