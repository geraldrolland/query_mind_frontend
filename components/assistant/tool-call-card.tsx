"use client";

import { Loader2 } from "lucide-react";

export function StreamingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2">
      <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
      <span className="text-xs text-slate-500">Thinking…</span>
    </div>
  );
}
