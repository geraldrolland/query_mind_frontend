import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const formatValue = (v: unknown): string => {
  if (typeof v === "number") return v.toLocaleString();
  return String(v ?? "");
};

export function formatLabel(value: unknown, labelKey: string): string {
  if (value === null || value === undefined) return "";

  const suffix = labelKey.split("_").pop();
  if (!suffix) return String(value);

  const m = /^(\d{4})-(\d{2})-\d{2}/.exec(String(value));

  if (["month", "day", "year"].includes(suffix)) {
    if (suffix === "year") return String(value);
    if (suffix === "month") return MONTHS[value as number] ?? String(value);
    return String(value);
  }

  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]);
    if (suffix === "year") return String(year);
    if (suffix === "month") return MONTHS[month] ?? String(value);

    const day = String(m.input).split("-")[2]?.split(" ")[0];
    return `${MONTHS[month]} ${day}, ${year}`;
  }

  return String(value ?? "");
}

export function formatRows(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return n.toLocaleString();
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
