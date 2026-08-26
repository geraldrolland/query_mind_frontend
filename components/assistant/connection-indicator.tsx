"use client";

interface ConnectionIndicatorProps {
  status: "connected" | "reconnecting" | "failed";
  countdown: number | null;
  attempt?: { current: number; total: number } | null;
}

export default function ConnectionIndicator({
  status,
  countdown,
  attempt,
}: ConnectionIndicatorProps) {
  const base =
    "relative flex h-6 w-6 items-center justify-center rounded-full transition-colors duration-300";

  if (status === "connected") {
    return (
      <div
        className={`${base} bg-emerald-500/90 shadow-[0_0_8px_rgba(16,185,129,0.55)]`}
        title="Connected"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className={`${base} bg-red-500/90`} title="Connection failed">
        <span className="text-sm font-bold leading-none text-white">!</span>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center" title="Reconnecting…">
      <div className={`${base} border-2 border-amber-400 bg-slate-900/80`}>
        {countdown !== null && countdown > 0 ? (
          <span className="text-[10px] font-semibold leading-none text-amber-300">
            {countdown}
          </span>
        ) : (
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
        )}
      </div>
      {attempt && (
        <span className="absolute -bottom-3 whitespace-nowrap text-[8px] uppercase tracking-wide text-slate-500">
          attempt {attempt.current}/{attempt.total}
        </span>
      )}
    </div>
  );
}
