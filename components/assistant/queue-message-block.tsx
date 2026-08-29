"use client"


import { Clock } from "lucide-react";
import { ChatMessage } from "@/lib/types";
import { motion } from "framer-motion";

const QueueMessageBlock = ({message}: {message: ChatMessage}) => {
    return(
        <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`mx-auto flex max-w-3xl justify-end opacity-60`}
        >
            <div
            className={`max-w-[92%] rounded-2xl px-4 py-3 sm:max-w-[85%] bg-indigo-500 text-white`}
            >
            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-indigo-200/60">
              <Clock className="h-3 w-3" />
              <span>queued</span>
            </div>
            </div>
        </motion.div>
    )
}

export default QueueMessageBlock;