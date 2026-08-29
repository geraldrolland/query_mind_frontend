"use client";

import { motion } from "framer-motion";

export function StreamingDots({status}: {status: string}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto flex max-w-3xl justify-start"
    >
      <div className="max-w-[92%] rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">{status}</span>
          <div className="flex items-center gap-0.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="block h-1.5 w-1.5 rounded-full bg-indigo-400"
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


