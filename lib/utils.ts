import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ChatMessage } from "./types";
import { DatasetMessage } from "./types";


export const checkComparisonData = (row: Record<string, unknown>): boolean => {
  if (Object.keys(row).length === 3) return true;
  return false
}

export const transformComparisonData = (rows: Record<string, unknown>[]): Record<string, unknown>[] => {
  const groupingField = inferGroupingField(rows);
  console.log("THIS IS THE GROUPING FIELD: ", groupingField)

  const transformedRows: Record<string, unknown>[] = [];

  for (let upperRow of rows) {
    const relatedRows = rows.filter((row) => row[groupingField] === upperRow[groupingField]);
    let comparisonRow: Record<string, unknown> = {}
    for (let row of relatedRows) {
      comparisonRow[groupingField] = row[groupingField];
      const otherFields = Object.keys(row).filter((key) => key !== groupingField);
      const comparisonField = row[otherFields[0]] as string;
      const metricField = otherFields[1];
      comparisonRow[comparisonField] = row[metricField];
    }
    if (transformedRows.find((row) => row[groupingField] === comparisonRow[groupingField])) continue;
    transformedRows.push(comparisonRow);
 
  }
  return transformedRows;
}

const inferGroupingField = (rows: Record<string, unknown>[]): string => {
  const firstRow = rows[0];
  console.log(firstRow);
  let record: {[K in "field1" | "field2"]: {seenCount: number, value: unknown, name: string}} | null = null;
  let keys = Object.keys(firstRow);
  keys.pop()

  console.log("THE KEYS: ", keys)
  record = {
    field1: {
      seenCount: 0, 
      value: keys ? firstRow[keys[0]] : "", 
      name: keys ? keys[0] : ""
    },
    field2: {
      seenCount: 0, 
      value: keys ? firstRow[keys[1]] : "", 
      name: keys ? keys[1] : ""
    },
}

rows.forEach((row: Record<string, unknown>) => {
  if (row[record.field1.name] === record.field1.value) {
    record.field1.seenCount += 1
  }

  if (row[record.field2.name] === record.field2.value) {
    record.field2.seenCount += 1
  }
})

console.log('THIS IS RECORD: ', record);

if (record.field1.seenCount < record.field2.seenCount) return record.field1.name;
return record.field2.name;
}



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const formatValue = (v: unknown): string => {
    if (typeof v === "number") return v.toLocaleString();
    return String(v ?? "");
  };

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatLabel(value: unknown, labelKey: string): string {
  if (value === null || value === undefined) return "";


  const suffix = labelKey.split("_").pop();
  console.log(suffix);
  if (!suffix) return String(value);

  const m = /^(\d{4})-(\d{2})-\d{2}/.exec(String(value));


  if (["month", "day", "year"].includes(suffix)) {
    console.log("IT IS A NUMBER", value);
    if (suffix === "year") return String(value);
    if (suffix === "month") return MONTHS[value as number] ?? String(value);
    return String(value);
  }

  else if (m) {
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (suffix === "year") return String(year);
  if (suffix === "month") return MONTHS[month] ?? String(value);
  }

  return String(value ?? "");
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