import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ChatMessage } from "./types";
import { DatasetMessage } from "./types";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const formatValue = (v: unknown): string => {
    if (typeof v === "number") return v.toLocaleString();
    return String(v ?? "");
  };

export function dateGranularity(dsl: Record<string, unknown>): string | null {
  const groupBy = dsl.group_by;
  if (!Array.isArray(groupBy)) return null;
  for (const entry of groupBy) {
    if (entry && typeof entry === "object" && "granularity" in entry) {
      const granularity = (entry as { granularity?: unknown }).granularity;
      if (typeof granularity === "string") return granularity;
    }
  }
  return null;
}

export function formatLabel(value: unknown, granularity: string | null): string {
  if (typeof value !== "string" && typeof value !== "number") return String(value ?? "");

  console.log(typeof(value));
  console.log(value);
  console.log(granularity);
  if (!granularity) return String(value);


  const m = /^(\d{4})-(\d{2})-\d{2}/.exec(String(value));
  if (!m) return String(value);
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (granularity === "year") return String(year);
  if (granularity === "quarter") return `Q${Math.floor((month - 1) / 3) + 1} ${year}`;
  if (granularity === "month") {
    const name = new Date(Date.UTC(year, month - 1, 1)).toLocaleString("en-US", {
      month: "short",
    });
    return `${name} ${year}`;
  }
  return String(value);
}

const QUEUE_KEY_PREFIX = "queuedMsgs";

export function readQueue(datasetId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(`${QUEUE_KEY_PREFIX}:${datasetId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export function writeQueue(queue: ChatMessage[], datasetId: string) {
  try {
    localStorage.setItem(`${QUEUE_KEY_PREFIX}:${datasetId}`, JSON.stringify(queue));
  } catch {
    /* ignore */
  }
}

export const clearQueue = (datasetId: string): void => {
  try {
    localStorage.removeItem(`${QUEUE_KEY_PREFIX}:${datasetId}`)
  } catch {
    console.log("error occured while clearing queue in local storage");
  }
}

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
    };
  }
  return {
    id: m.id,
    role: m.role,
    content: String(m.content ?? ""),
    type: "text",
    is_error: m.is_error,
  };
}

export const getInflightId = (datasetId: string): string | null => {
  try {
    const inflightId = localStorage.getItem(`inflight_id:${datasetId}`)
    return inflightId
  } catch {
    console.log("error occurred while get the current inflight_id from local storage");
    return null
  }
}

export const setInflightId = (msgSuffix: string, datasetId: string): void => {
  try {
    localStorage.setItem(`inflight_id:${datasetId}`, msgSuffix)
  } catch {
    console.log("error occurred while setting the current inflight_id in local storage");
  }
}

export const removeInflightId = (datasetId: string): void => {
  try {
    localStorage.removeItem(`inflight_id:${datasetId}`)
  } catch {
    console.log("error occurred while removing current inflight_id  from local storage");
  }
}


export const popQueueMsg = (inFlightId: string, datasetId: string): void => {
    writeQueue(readQueue(datasetId).filter((m) => m.id !== inFlightId), datasetId);
}