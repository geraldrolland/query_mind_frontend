"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createChatSocket, messageToHistory, type ResumeReply } from "@/lib/api/chat";
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

const PLACEHOLDER_ID = "streaming-placeholder";
const RESUME_REPLY_TIMEOUT_MS = 2000;

export function useChat(
  datasetId: string,
  options?: { onResumeDoneRef?: React.RefObject<(() => void) | undefined> }
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const optionsRef = useRef(options);
  const historyRef = useRef<ChatMessage[]>([]);
  const liveVersionRef = useRef(0);
  const sendingRef = useRef(false);
  const streamingRef = useRef(false);
  const socketRef = useRef<WebSocket | null>(null);
  const mountedRef = useRef(true);
  const closedByUsRef = useRef(false);
  const pendingPayloadRef = useRef<{
    message: string;
    history: { role: "user" | "assistant"; content: string }[];
  } | null>(null);
  const resumePendingRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    optionsRef.current = options;
  });

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const updateStreaming = useCallback((value: boolean) => {
    streamingRef.current = value;
    setStreaming(value);
  }, []);

  const handleEvent = useCallback(
    (event: ChatEvent) => {
      liveVersionRef.current += 1;
      if (event.event === "message") {
        const incoming = recordFromEvent(event);
        console.log("[useChat] message event:", incoming.id, "content-len:", String(incoming.content).length, "before:", historyRef.current.length);
        historyRef.current = historyRef.current.filter(
          (m) => m.id !== PLACEHOLDER_ID
        );
        historyRef.current = historyRef.current.map((m) =>
          m.id === incoming.id ? incoming : m
        );
        if (!historyRef.current.some((m) => m.id === incoming.id)) {
          historyRef.current = [...historyRef.current, incoming];
        }
        console.log("[useChat] after append:", historyRef.current.length, "last-id:", historyRef.current[historyRef.current.length - 1]?.id);
        updateStreaming(false);
        setProgress(null);
        setMessages([...historyRef.current]);
      } else if (event.event === "progress") {
        setProgress(event.data.status);
      } else if (event.event === "delta") {
        const last = historyRef.current[historyRef.current.length - 1];
        if (last?.id === PLACEHOLDER_ID) {
          historyRef.current = [
            ...historyRef.current.slice(0, -1),
            { ...last, content: last.content + event.data.content },
          ];
        } else {
          historyRef.current = [
            ...historyRef.current,
            {
              id: PLACEHOLDER_ID,
              role: "assistant",
              content: event.data.content,
            },
          ];
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
        updateStreaming(false);
        setProgress(null);
        setMessages([...historyRef.current]);
      }
    },
    [updateStreaming]
  );

  const handleDone = useCallback(() => {
    liveVersionRef.current += 1;
    sendingRef.current = false;
    updateStreaming(false);
    setProgress(null);
  }, [updateStreaming]);

  const handleError = useCallback(
    (message: string) => {
      liveVersionRef.current += 1;
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
      sendingRef.current = false;
      updateStreaming(false);
      setProgress(null);
      setMessages([...historyRef.current]);
    },
    [updateStreaming]
  );

  const handleResumeReply = useCallback(
    (reply: ResumeReply) => {
      resumePendingRef.current = false;
      clearResumeTimer();
      if (reply.kind === "done") {
        sendingRef.current = false;
        pendingPayloadRef.current = null;
        updateStreaming(false);
        setProgress(null);
        optionsRef.current?.onResumeDoneRef?.current?.();
      } else {
        updateStreaming(true);
        setProgress(reply.status);
      }
    },
    [clearResumeTimer, updateStreaming]
  );

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    closedByUsRef.current = false;
    resumePendingRef.current = true;
    const existing = socketRef.current;
    if (existing && existing.readyState !== WebSocket.CLOSED) {
      existing.close(1000, "replaced by new connection");
    }
    socketRef.current = null;
    const socket = createChatSocket(datasetId, {
      onEvent: handleEvent,
      onDone: handleDone,
      onError: handleError,
      onResumeReply: handleResumeReply,
      onOpen: () => {
        const pending = pendingPayloadRef.current;
        if (pending && socket.readyState === WebSocket.OPEN) {
          pendingPayloadRef.current = null;
          socket.send(JSON.stringify(pending));
        }
        clearResumeTimer();
        resumeTimerRef.current = setTimeout(() => {
          if (!resumePendingRef.current) return;
          resumePendingRef.current = false;
          if (sendingRef.current) {
            handleError(
              "The connection dropped and your last question was not answered. Please try again."
            );
          }
        }, RESUME_REPLY_TIMEOUT_MS);
      },
    });
    socketRef.current = socket;

    socket.onclose = () => {
      if (closedByUsRef.current) return;
      if (socketRef.current !== socket) return;
      socketRef.current = null;
      clearResumeTimer();
      if (streamingRef.current) {
        handleError("The connection was lost. Please try again.");
      }
    };
  }, [
    datasetId,
    handleEvent,
    handleDone,
    handleError,
    handleResumeReply,
    clearResumeTimer,
  ]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      closedByUsRef.current = true;
      clearResumeTimer();
      socketRef.current?.close(1000, "page unmounted");
      socketRef.current = null;
    };
  }, [connect, clearResumeTimer]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming || sendingRef.current) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };

      const nextMessages = [...historyRef.current, userMsg];
      historyRef.current = nextMessages;
      setMessages(nextMessages);
      updateStreaming(true);
      setProgress(null);

      const payload = {
        message: trimmed,
        history: messageToHistory(historyRef.current.slice(0, -1)),
      };

      const socket = socketRef.current;
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(payload));
      } else if (socket && socket.readyState === WebSocket.CONNECTING) {
        pendingPayloadRef.current = payload;
      } else {
        handleError("The connection was lost. Please try again.");
      }
    },
    [streaming, updateStreaming, handleError]
  );

  const reset = useCallback(() => {
    historyRef.current = [];
    setMessages([]);
    setProgress(null);
  }, []);

  const load = useCallback((loaded: ChatMessage[]) => {
    const seen = new Set<string>();
    const unique = loaded.filter((m) => !seen.has(m.id) && seen.add(m.id));
    historyRef.current = unique;
    setMessages(unique);
  }, []);

  return { messages, streaming, progress, send, reset, load, liveVersionRef };
}