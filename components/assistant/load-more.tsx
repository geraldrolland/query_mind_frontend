"use client"

import { motion } from "framer-motion";

const LoadMore = () => {
    return(
        <>
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="mx-auto flex max-w-3xl justify-center"
            >
              <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-1.5 text-xs text-slate-400">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                Loading more messages…
              </div>
            </motion.div>
        </>
    )
}

export default LoadMore;