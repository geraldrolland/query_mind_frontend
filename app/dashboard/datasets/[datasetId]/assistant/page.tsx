"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Sparkles, SendHorizonal } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useDatasets } from "@/hooks/useDatasets";
import { datasetApi } from "@/lib/api/datasets";
import type { ChatMessage, DatasetMessage } from "@/lib/types";
import { RecordBlock } from "@/components/assistant/record-block";
import { StreamingDots } from "@/components/assistant/tool-call-card";

const SUGGESTIONS = [
  "Show me the first 10 rows",
  "How many rows are in this dataset?",
  "Which columns have missing values?",
  "Summarize the data",
];

function toChatMessage(m: DatasetMessage): ChatMessage {
  if (m.type === "record") {
    return {
      id: m.id,
      role: m.role,
      content: "",
      type: "record",
      chartType: m.chart_type,
      record: m.content as unknown as Record<string, unknown>,
    };
  }
  return {
    id: m.id,
    role: m.role,
    content: String(m.content ?? ""),
    type: "text",
    is_error: m.is_error,
  };
}

export default function AssistantPage() {
  const params = useParams<{ datasetId: string }>();
  const datasetId = params.datasetId;
  const { messages, streaming, progress, send, load } = useChat(datasetId);
  const { datasets } = useDatasets();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(1);
  const totalRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const skipScrollRef = useRef(false);

  const dataset = datasets.find((d) => d.id === datasetId);

  useEffect(() => {
    let cancelled = false;

    datasetApi      
      .messages(datasetId)
      .then((res) => {
        if (cancelled) return;
        const history: ChatMessage[] = res.messages
          .slice()
          .reverse()
          .map(toChatMessage);
        pageRef.current = 1;
        totalRef.current = res.total;
        load(history);
      })
      .catch(() => {
        /* ignore; chat starts empty */
      });

    return () => {
      cancelled = true;
    };
  }, [datasetId, load]);

  const loadMoreMessages = useCallback(async () => {
    if (loadingMoreRef.current) return;
    if (totalRef.current > 0 && messages.length >= totalRef.current) return;
    loadingMoreRef.current = true;
    try {
      const res = await datasetApi.messages(datasetId, pageRef.current + 1);
      if (res.messages.length === 0) {
        totalRef.current = messages.length;
        return;
      }
      const older: ChatMessage[] = res.messages
        .slice()
        .reverse()
        .map(toChatMessage);
      const el = scrollRef.current;
      const prevHeight = el ? el.scrollHeight : 0;
      const prevTop = el ? el.scrollTop : 0;
      skipScrollRef.current = true;
      load([...older, ...messages]);
      if (el) el.scrollTop = prevTop + (el.scrollHeight - prevHeight);
      pageRef.current += 1;
      totalRef.current = res.total;
    } catch {
      /* ignore; retry on next intersection */
    } finally {
      loadingMoreRef.current = false;
    }
  }, [datasetId, load, messages]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || messages.length === 0) return;
    const firstNode = container.firstElementChild;
    if (!firstNode) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.5)) {
          loadMoreMessages();
        }
      },
      { root: container, threshold: [0.5] }
    );
    observer.observe(firstNode);
    return () => observer.disconnect();
  }, [messages.length, loadMoreMessages]);

  useEffect(() => {
    if (skipScrollRef.current) {
      skipScrollRef.current = false;
      return;
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming, progress]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
    setInput("");
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <div>
          <Link
            href={`/dashboard/datasets/${datasetId}`}
            className="mb-0.5 flex items-center gap-1 text-xs text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" /> {dataset?.name || "Dataset"}
          </Link>
          <h1 className="flex items-center gap-2 text-lg font-bold">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            AI Assistant
          </h1>
        </div>
        <span className="rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-400">
          {dataset?.total_rows.toLocaleString()} rows
        </span>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
        {messages.length === 0 && (
          <div className="mx-auto mt-16 max-w-xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15">
              <Sparkles className="h-7 w-7 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold">Ask anything about your data</h2>
            <p className="mt-2 text-sm text-slate-400">
              QueryMind converts your question into a structured query, runs it
              against your dataset, and explains the results.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-indigo-500 hover:text-indigo-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`mx-auto flex max-w-3xl ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                m.role === "user"
                  ? "bg-indigo-500 text-white"
                  : m.is_error
                    ? "border border-red-500/40 bg-red-500/10 text-red-100"
                    : "border border-slate-800 bg-slate-900/70 text-slate-100"
              }`}
            >
              {m.role === "user" ? (
                <p className="whitespace-pre-wrap text-sm">{m.content}</p>
              ) : (
                <div className="space-y-3">
                  {m.type === "record" ? (
                    m.record && m.chartType ? (
                      <RecordBlock
                        datasetId={datasetId}
                        dsl={m.record}
                        chartType={m.chartType}
                      />
                    ) : (
                      <StreamingDots />
                    )
                  ) : (
                    <>
                      {m.content && (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                      )}
                    </>
                  )}
                  {m.error && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                      {m.error}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {streaming && (
          <div className="mx-auto flex max-w-3xl justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-1.5">
              <StreamingDots />
              {progress && <span className="text-xs text-slate-400">{progress}</span>}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="border-t border-slate-800 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
                setInput("");
              }
            }}
            rows={2}
            placeholder="Ask about your data… (e.g. average revenue by region, top 5)"
            className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white hover:bg-indigo-400 disabled:opacity-40"
          >
            <SendHorizonal className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
