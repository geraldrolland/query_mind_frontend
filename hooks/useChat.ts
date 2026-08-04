"use client";

import { useCallback, useRef, useState } from "react";
import { messageToHistory, streamChat } from "@/lib/api/chat";
import type { ChatEvent, ChatMessage } from "@/lib/types";

function recordFromEvent(
  event: Extract<ChatEvent, { event: "message" }>
): ChatMessage {
  const base: ChatMessage = {
    id: event.data.id,
    role: event.data.role === "user" ? "user" : "assistant",
    content: "",
    is_error: event.data.is_error,
  };
  if (event.data.type === "record" && event.data.content) {
    let content: Record<string, unknown>;
    try {
      content =
        typeof event.data.content === "string"
          ? (JSON.parse(event.data.content) as Record<string, unknown>)
          : (event.data.content as Record<string, unknown>);
    } catch {
      return { ...base, type: "text", content: String(event.data.content ?? "") };
    }
    return { ...base, type: "record", chartType: event.data.chart_type, record: content };
  }
  return { ...base, type: "text", content: String(event.data.content ?? "") };
}

export function useChat(datasetId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const historyRef = useRef<ChatMessage[]>([]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };

      const nextMessages = [...historyRef.current, userMsg];
      historyRef.current = nextMessages;
      setMessages(nextMessages);
      setStreaming(true);

      const history = messageToHistory(historyRef.current.slice(0, -1));

      try {
        await streamChat(datasetId, trimmed, history, {
          onEvent: (event: ChatEvent) => {
            if (event.event === "message") {
              const incoming = recordFromEvent(event);
              historyRef.current = historyRef.current.map((m) =>
                m.id === incoming.id ? incoming : m
              );
              if (!historyRef.current.some((m) => m.id === incoming.id)) {
                historyRef.current = [...historyRef.current, incoming];
              }
              setMessages([...historyRef.current]);
            } else if (event.event === "error") {
              if (historyRef.current[historyRef.current.length - 1]?.role === "user") {
                historyRef.current = [
                  ...historyRef.current,
                  {
                    id: `a-${Date.now()}`,
                    role: "assistant",
                    content: "",
                    error: event.data.message,
                    is_error: true,
                  },
                ];
              } else {
                historyRef.current = historyRef.current.map((m, i) =>
                  i === historyRef.current.length - 1
                    ? { ...m, error: event.data.message, is_error: true }
                    : m
                );
              }
              setMessages([...historyRef.current]);
            }
          },
          onError: (message) => {
            historyRef.current = [
              ...historyRef.current,
              {
                id: `a-${Date.now()}`,
                role: "assistant",
                content: "",
                error: message,
                is_error: true,
              },
            ];
            setMessages([...historyRef.current]);
          },
          onDone: () => {
            setStreaming(false);
          },
        });
      } finally {
        setStreaming(false);
      }
    },
    [datasetId, streaming]
  );

  const reset = useCallback(() => {
    historyRef.current = [];
    setMessages([]);
  }, []);

  const load = useCallback((loaded: ChatMessage[]) => {
    historyRef.current = loaded;
    setMessages(loaded);
  }, []);

  return { messages, streaming, send, reset, load };
}