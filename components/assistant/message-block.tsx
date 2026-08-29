"use client"

import { ChatMessage } from "@/lib/types";
import { motion } from "framer-motion";
import { Clock, Loader2, Check } from "lucide-react";
import AssistantContentBlock from "./assistant-content-block";
import UserContentBlock from "./user-content-block";
import AssistantErrorBlock from "./assistant-error-block";
import { RecordBlock } from "./record-block";
import { useParams } from "next/navigation";



const MessageBlock = ({message}: {message: ChatMessage}) => {
    const params = useParams();
    const datasetId = params.datasetId;
    const isQueued = message.status === "queued";

    return(
        <motion.div
                layout
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`mx-auto flex max-w-3xl ${
                message.role === "user" ? "justify-end" : "justify-start"
                } ${isQueued ? "opacity-60" : ""}`}
            >
                <div
                className={`max-w-[92%] rounded-2xl px-4 py-3 sm:max-w-[85%] ${
                    message.role === "user"
                    ? "bg-indigo-500 text-white"
                    : message.is_error
                        ? "border border-red-500/40 bg-red-500/10 text-red-100"
                        : "border border-slate-800 bg-slate-900/70 text-slate-100"
                }`}
                >
                {message.role === "user" ? (
                    <div>
                        <UserContentBlock content={message.content} />
                        {message.status === "pending" && (
                            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-indigo-200/60">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>sending</span>
                            </div>
                        )}
                        {message.status === "sent" && (
                            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-indigo-200/60">
                                <Check className="h-3 w-3" />
                                <span>sent</span>
                            </div>
                        )}
                        {message.status === "failed" && (
                            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-red-200/60">
                                <span>failed</span>
                            </div>
                        )}
                        {isQueued && (
                            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-indigo-200/60">
                                <Clock className="h-3 w-3" />
                                <span>queued</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                    {message.type === "record" ? (
                        <RecordBlock datasetId={datasetId as string} dsl={message.record as Record<string, unknown>} chartType={message.chartType as string}/>
                        ) : (
                        <>
                        {message.content && <AssistantContentBlock content={message.content} />}
                        </>
                    )}
                    {message.error && <AssistantErrorBlock content={message.error} />}
                    </div>
                )}
                </div>
            </motion.div>
    )
}

export default MessageBlock;