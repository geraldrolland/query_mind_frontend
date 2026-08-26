"use client"

import { ChatMessage } from "@/lib/types";
import { motion } from "framer-motion";
import AssistantContentBlock from "./assistant-content-block";
import UserContentBlock from "./user-content-block";
import AssistantErrorBlock from "./assistant-error-block";
import { RecordBlock } from "./record-block";
import { useParams } from "next/navigation";



const MessageBlock = ({message}: {message: ChatMessage}) => {
    const params = useParams();
    const datasetId = params.datasetId;

    return(
    <>
        <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`mx-auto flex max-w-3xl ${
                message.role === "user" ? "justify-end" : "justify-start"
                }`}
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
                            <p className="mt-1 text-right text-[10px] uppercase tracking-wide text-indigo-200">
                                sending…
                            </p>
                        )}
                        {message.status === "failed" && (
                            <p className="mt-1 text-right text-[10px] uppercase tracking-wide text-red-200">
                                failed
                            </p>
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
    </>
    )
}

export default MessageBlock;