"use client"

import { memo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "Show me the first 10 rows",
  "How many rows are in this dataset?",
  "Which columns have missing values?",
  "Summarize the data",
];

interface SuggestionBlockPropType {
    handleSend: (text: string) => void
    disabled?: boolean
}

const SuggestionBlock = memo(({ handleSend, disabled = false }: SuggestionBlockPropType) => {
    return(
        <>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mx-auto mt-16 max-w-xl text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.15 }}
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15"
            >
              <Sparkles className="h-7 w-7 text-indigo-400" />
            </motion.div>
            <h2 className="text-xl font-bold">Ask anything about your data</h2>
            <p className="mt-2 text-sm text-slate-400">
              QueryMind converts your question into a structured query, runs it
              against your dataset, and explains the results.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s, i) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.08, duration: 0.35 }}
                  whileHover={disabled ? undefined : { scale: 1.05 }}
                  whileTap={disabled ? undefined : { scale: 0.96 }}
                  onClick={() => !disabled && handleSend(s)}
                  disabled={disabled}
                  className={`rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 ${
                    disabled
                      ? "cursor-not-allowed opacity-50"
                      : "hover:border-indigo-500 hover:text-indigo-300"
                  }`}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
    )
});

SuggestionBlock.displayName = "SuggestionBlock";
export default SuggestionBlock;