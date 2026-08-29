import { formatLabel, formatValue } from "@/lib/utils";

interface TableChartPropType {
    rows: Record<string, unknown>[],
    keys: string[],
    labelKey: string,
}

const TableChart = ({rows, keys, labelKey}: TableChartPropType) => {
    return(
        <>
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
                    <td key={k} className="px-3 py-2 text-slate-200">
                      {k === labelKey
                        ? formatLabel(row[k], labelKey)
                        : formatValue(row[k])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
    )
}

export default TableChart;