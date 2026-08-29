import type { DatasetMessage, ChatMessage } from "./types";

export { cn, formatValue, formatLabel, formatRows, formatBytes } from "./formatting";
export { checkComparisonData, transformComparisonData, inferGroupingField } from "./chart-data";
export { CHART_COLORS } from "./chart-config";
export { readQueue, writeQueue, clearQueue, popQueueMsg, getInflightId, setInflightId, removeInflightId } from "./queue";

export function parseFrame(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function toChatMessage(m: DatasetMessage): ChatMessage {
  if (m.type === "record") {
    return {
      id: m.id,
      role: m.role,
      content: "",
      type: "record",
      chartType: m.chart_type,
      record: m.content as unknown as Record<string, unknown>,
      status: "sent",
    };
  }
  return {
    id: m.id,
    role: m.role,
    content: String(m.content ?? ""),
    type: "text",
    is_error: m.is_error,
    status: "sent",
  };
}
