"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { datasetApi } from "@/lib/api/datasets";
import { wsUrl } from "@/lib/api/chat";
import type { ChatMessage, Dataset } from "@/lib/types";
import MessageBlock from "@/components/assistant/message-block";
import SuggestionBlock from "@/components/assistant/suggestion-block";
import LoadMore from "@/components/assistant/load-more";
import InputBlock from "@/components/assistant/chat-input-block";
import HeaderBlock from "@/components/assistant/header-block";
import { StreamingDots } from "@/components/assistant/tool-call-card";
import QueueMessageBlock from "@/components/assistant/queue-message-block";
import ConnectionIndicator from "@/components/assistant/connection-indicator";
import { readQueue, writeQueue, toChatMessage, parseFrame, getInflightId, setInflightId, removeInflightId, popQueueMsg } from "@/lib/utils";

const QUEUE_KEY_PREFIX = "queuedMsgs";
const MAX_MESSAGE_CHARS = 4000;
const PING_INTERVAL_MS = 25000;
const RECONNECT_DELAYS_MS = [1000, 2000, 3000, 4000, 5000];

function sameMessage(a: string, b: string): boolean {
  return a === b || a.includes(b) || b.includes(a);
}

export default function AssistantPage() {
  const params = useParams<{ datasetId: string }>();
  const datasetId = params.datasetId;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const pageRef = useRef(1);
  const totalRef = useRef(0);
  const skipScrollRef = useRef(false);
  const socketRef = useRef<WebSocket | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const messageReceivedRef = useRef(false);
  const mountedRef = useRef(true);
  const closedByUsRef = useRef(false);
  const streamingRef = useRef(false);
  const reconnectStepRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingPayloadRef = useRef<string | null>(null);
  const datasetIdRef = useRef(datasetId);
  const sendQueryRef = useRef<(msg: ChatMessage) => void>(() => {});
  const promoteNextRef = useRef<() => void>(() => {});
  const endStreamRef = useRef<
    (refetchIfSilent: boolean) => void | Promise<void>
  >(() => {});
  const endStreamRunningRef = useRef(false);
  const reconnectedDuringStreamRef = useRef(false);
  const [streaming, setStreaming] = useState<boolean>(false);
  const [status, setStatus] = useState<string | null>(null);
  const [queueMessages, setQueueMessages] = useState<ChatMessage[]>([])
  const [disableSendBtn, setDisableSendBtn] = useState<boolean>(true);
  const [datasetMeta, setDatasetMeta] = useState<Dataset | null>(null);
  const [connectFailed, setConnectFailed] = useState(false);
  const [connStatus, setConnStatus] = useState<
    "connected" | "reconnecting" | "failed"
  >("reconnecting");
  const [reconnectCountdown, setReconnectCountdown] = useState(0);
  const [reconnectAttempt, setReconnectAttempt] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    datasetIdRef.current = datasetId;
  }, [datasetId]);

  const clearCountdownTimer = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const setStreamingSafe = (value: boolean) => {
    streamingRef.current = value;
    setStreaming(value);
  };

  const refetchLatest = async () => {
    try {
      const res = await datasetApi.messages(datasetId, 1);
      if (!mountedRef.current) return;
      totalRef.current = res.total;
      const latest = res.messages.slice().reverse().map(toChatMessage);
      setMessages((prev) => {
        const fresh = latest.filter(
          (c) => !prev.some((p) => sameMessage(p.id, c.id))
        );
        return fresh.length ? [...prev, ...fresh] : prev;
      });
    } catch {
      /* history stays as-is; retry happens on next completion */
    }
  };

  const endStream = async (refetchIfSilent: boolean) => {
    if (endStreamRunningRef.current) return;
    endStreamRunningRef.current = true;

    const inflightId = getInflightId(datasetId);

    setStreamingSafe(false);
    setStatus(null);

    const needRefetch =
      refetchIfSilent &&
      inflightId !== null &&
      (!messageReceivedRef.current || reconnectedDuringStreamRef.current);

    if (needRefetch) await refetchLatest();

    if (inflightId) {
      removeInflightId(datasetId);
      popQueueMsg(inflightId, datasetId);
    }

    messageReceivedRef.current = false;
    reconnectedDuringStreamRef.current = false;
    endStreamRunningRef.current = false;

    promoteNextRef.current();
  };
  useEffect(() => {
    endStreamRef.current = endStream;
  });

  const stopPinger = useCallback(() => {
    if (pingTimerRef.current) {
      clearInterval(pingTimerRef.current);
      pingTimerRef.current = null;
    }
  }, []);

  const startPinger = useCallback(() => {
    stopPinger();
    pingTimerRef.current = setInterval(() => {
      const sock = socketRef.current;
      if (sock && sock.readyState === WebSocket.OPEN) {
        try {
          sock.send('{"ping": 1}');
        } catch {
          /* close handler takes over */
        }
      }
    }, PING_INTERVAL_MS);
  }, [stopPinger]);

  const scheduleReconnectRef = useRef<() => void>(() => {});

  const connect = useCallback(() => {
    if (!mountedRef.current || closedByUsRef.current) {
      console.warn("[ws] connect blocked", {
        mounted: mountedRef.current,
        closedByUs: closedByUsRef.current,
      });
      return;
    }
    const existing = socketRef.current;
    if (
      existing &&
      (existing.readyState === WebSocket.OPEN ||
        existing.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }
    const dsId = datasetIdRef.current;
    const socket = new WebSocket(wsUrl(dsId));
    socketRef.current = socket;
    console.info("[ws] connecting", wsUrl(dsId));

    socket.onopen = () => {
      if (socketRef.current !== socket) return;
      console.info("[ws] open");
      reconnectStepRef.current = 0;
      setConnStatus("connected");
      setReconnectCountdown(0);
      setReconnectAttempt(null);
      clearCountdownTimer();
      startPinger();
      const pending = pendingPayloadRef.current;
      if (pending) {
        pendingPayloadRef.current = null;
        try {
          socket.send(pending);
        } catch {
          /* fall through to queue recovery */
        }
        return;
      }
      if (getInflightId(dsId) === null) {
        promoteNextRef.current();
      }
    };

    socket.onmessage = (event) => {
      if (socketRef.current !== socket) return;
      const frame = parseFrame(String(event.data ?? ""));
      if (!frame) return;
      const inFlightId = getInflightId(datasetIdRef.current);

      if (frame.pong === 1) return;

      if (typeof frame.progress === "string") {
        setStreamingSafe(true);
        setStatus(frame.progress);
        if (inFlightId) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id.includes(inFlightId) ? { ...m, status: "sent" as const } : m
            )
          );
          popQueueMsg(inFlightId, datasetIdRef.current);
        }
        return;
      }

      if (frame.done === true) {
        void endStreamRef.current(true);
        return;
      }

      if (frame.role === "assistant") {
        const incoming: ChatMessage = {
          id: String(frame.id ?? ""),
          role: "assistant",
          content: typeof frame.content === "string" ? frame.content : "",
          error: typeof frame.error === "string" ? frame.error : "",
          type: frame.type === "record" ? "record" : "text",
          chartType: frame.chart_type ? String(frame.chart_type) : undefined,
          record:
            frame.type === "record"
              ? (frame.content as Record<string, unknown>)
              : undefined,
          is_error: Boolean(frame.is_error),
        };
        if (!incoming.id) return;
        setMessages((prev) => {
          if (prev.some((m) => m.id === incoming.id)) return prev;
          return [...prev, incoming];
        });
        if (!messageReceivedRef.current) {
          if (inFlightId) popQueueMsg(inFlightId, datasetIdRef.current);
          removeInflightId(datasetIdRef.current);
          messageReceivedRef.current = true;
          setStreamingSafe(false);
          setStatus(null);
        }
        return;
      }

      if (frame.error) {
        const errMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "",
          error: String(frame.error),
          is_error: true,
        };
        if (inFlightId) {
          setMessages((prev) => [
            ...prev.map((m) =>
              m.id.includes(inFlightId)
                ? { ...m, status: "failed" as const }
                : m
            ),
            errMsg,
          ]);
        } else {
          setMessages((prev) => [...prev, errMsg]);
        }
        void endStreamRef.current(false);
        return;
      }
    };

    socket.onclose = (event: CloseEvent) => {
      if (socketRef.current !== socket) return;
      console.warn("[ws] close", event.code, event.reason || "(no reason)");
      stopPinger();
      socketRef.current = null;
      if (event.code === 1008 || event.code === 1013) {
        setConnStatus("failed");
        setConnectFailed(true);
        return;
      }
      scheduleReconnectRef.current();
    };
  }, [startPinger, stopPinger, clearCountdownTimer]);

  const scheduleReconnect = useCallback(() => {
    if (!mountedRef.current || closedByUsRef.current) return;
    if (reconnectTimerRef.current) return;
    if (streamingRef.current) reconnectedDuringStreamRef.current = true;

    if (reconnectStepRef.current >= RECONNECT_DELAYS_MS.length) {
      reconnectStepRef.current = RECONNECT_DELAYS_MS.length;
      setConnStatus("failed");
      setReconnectCountdown(0);
      clearCountdownTimer();
      setConnectFailed(true);
      return;
    }

    const delay = RECONNECT_DELAYS_MS[reconnectStepRef.current];
    reconnectStepRef.current += 1;

    setConnStatus("reconnecting");
    setReconnectAttempt({
      current: Math.min(reconnectStepRef.current, RECONNECT_DELAYS_MS.length),
      total: RECONNECT_DELAYS_MS.length,
    });
    setReconnectCountdown(Math.round(delay / 1000));
    clearCountdownTimer();
    countdownTimerRef.current = setInterval(() => {
      setReconnectCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null;
      const sock = socketRef.current;
      if (sock && sock.readyState !== WebSocket.CLOSED) return;
      connect();
    }, delay);
  }, [connect, clearCountdownTimer]);

  useEffect(() => {
    scheduleReconnectRef.current = scheduleReconnect;
  }, [scheduleReconnect]);

  const loadMoreMessages = async () => {
    if (loadingMore) return;
    if (totalRef.current > 0 && messages.length >= totalRef.current) return;
    setLoadingMore(true);
    try {
      const requestedPage = pageRef.current + 1;
      const res = await datasetApi.messages(datasetId, requestedPage);
      if (res.messages.length === 0) {
        totalRef.current = messages.length;
        return;
      }
      const older = res.messages.slice().reverse().map(toChatMessage);
      skipScrollRef.current = true;
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const unique = older.filter((m) => !seen.has(m.id));
        return [...unique, ...prev];
      });
      pageRef.current += 1;
      totalRef.current = res.total;
    } catch {
      /* retry on next intersection */
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          void loadMoreMessages();
        }
      },
      { root: scrollRef.current, rootMargin: "160px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  });

  useEffect(() => {
    mountedRef.current = true;
    closedByUsRef.current = false;

    let active = true;
    let historyMsgs: ChatMessage[] | undefined;

    datasetApi
      .messages(datasetId)
      .then((res) => {
        if (!active) return;
        const datasetMsgs = res.messages.slice();
        if (datasetMsgs.length > 0) {
          historyMsgs = datasetMsgs.reverse().map(toChatMessage);
          pageRef.current = 1;
          totalRef.current = res.total;
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!active) return;
        const inFlightId = getInflightId(datasetId);
        let queued = readQueue(datasetId);
        if (inFlightId) {
          const inflightMsg = historyMsgs?.find((m) =>
            m.id.includes(inFlightId)
          );
          if (inflightMsg) {
            const answered =
              historyMsgs![historyMsgs!.length - 1].id !== inflightMsg.id;
            if (answered) {
              removeInflightId(datasetId);
            }
            queued = queued.filter((m) => !sameMessage(m.id, inflightMsg.id));
            writeQueue(queued, datasetId);
          } else {
            const nextMsg = queued.find((m) => m.id === inFlightId);
            if (nextMsg) {
              historyMsgs = historyMsgs ? [...historyMsgs, nextMsg] : [nextMsg];
              queued = queued.filter((m) => m.id !== nextMsg.id);
              writeQueue(queued, datasetId);
            } else {
              removeInflightId(datasetId);
            }
          }
        }
        if (historyMsgs) {
          setMessages(historyMsgs);
        }
        setQueueMessages(queued);
        setDisableSendBtn(false);
        connect();
      });

    return () => {
      active = false;
      mountedRef.current = false;
      closedByUsRef.current = true;
      stopPinger();
      clearCountdownTimer();
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      socketRef.current?.close(1000, "page unmounted");
      socketRef.current = null;
    };
  }, [datasetId, connect, scheduleReconnect, startPinger, stopPinger, clearCountdownTimer]);

  useEffect(() => {
    if (!mountedRef.current) return;
    let cancelled = false;
    datasetApi
      .get(datasetId)
      .then((d) => {
        if (!cancelled) setDatasetMeta(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [datasetId]);

  useEffect(() => {
    if (skipScrollRef.current) {
      skipScrollRef.current = false;
      return;
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const [inputValue, setInputValue] = useState("");

  const sendQuery = (msg: ChatMessage) => {
    const socket = socketRef.current;
    reconnectedDuringStreamRef.current = false;
    const history = messagesRef.current
      .filter((m) => m.id !== msg.id)
      .filter((m) => m.role === "user" || (m.role === "assistant" && !m.is_error && !m.error && m.type !== "record"))
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));
    const payload = JSON.stringify({ message: msg, history });
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(payload);
    } else {
      pendingPayloadRef.current = payload;
      if (!socket || socket.readyState === WebSocket.CLOSED) {
        closedByUsRef.current = false;
        reconnectStepRef.current = 0;
        clearCountdownTimer();
        setReconnectCountdown(0);
        setConnStatus("reconnecting");
        connect();
      }
    }
  };

  const promoteNext = () => {
    const queue = readQueue(datasetId);
    if (queue.length === 0) return;
    const next = queue[0];
    next.status = "pending";
    writeQueue(queue, datasetId);
    setInflightId(next.id, datasetId);
    setQueueMessages(queue.slice(1))
    setMessages((prev) =>
      prev.some((m) => m.id === next.id) ? prev : [...prev, next]
    );
    sendQuery(next);
  }

  useEffect(() => {
    sendQueryRef.current = sendQuery;
    promoteNextRef.current = promoteNext;
  });

  const handleSend = (text: string) => {
      const trimmed = text.trim().slice(0, MAX_MESSAGE_CHARS);
      if (!trimmed) return;
      const id = crypto.randomUUID();
      const userMsg: ChatMessage = {
        id,
        role: "user",
        content: trimmed,
      };
      try {
        const raw = localStorage.getItem(`${QUEUE_KEY_PREFIX}:${datasetId}`);
        const inflightId = getInflightId(datasetId);
        if (!inflightId) {
          userMsg.status = "pending";
          localStorage.setItem(`${QUEUE_KEY_PREFIX}:${datasetId}`, JSON.stringify([userMsg]));
          setMessages((prev) => [...prev, userMsg]);
          setInflightId(userMsg.id, datasetId);
          sendQuery(userMsg);
        } else {
          userMsg.status = "queued";
          const parsed = JSON.parse(raw as string);
          const queue: ChatMessage[] = Array.isArray(parsed) ? parsed : [];
          queue.push(userMsg);
          localStorage.setItem(`${QUEUE_KEY_PREFIX}:${datasetId}`, JSON.stringify(queue));
          setQueueMessages((prev) => [...prev, userMsg]);
        }
      } catch {
        userMsg.status = "pending";
        setMessages((prev) => [...prev, userMsg]);
        sendQuery(userMsg);
      }
      const st = socketRef.current?.readyState;
      if (st !== WebSocket.OPEN && st !== WebSocket.CONNECTING) {
        scheduleReconnect();
      }
      setInputValue("");
    }

  const messageNodes = useMemo(() => {
    if (messages.length === 0) return null;
    const visible = messages.filter(
      (m) =>
        m.role === "user" ||
        m.type === "record" ||
        Boolean(m.content) ||
        Boolean(m.error)
    );
    return visible.map((m) => ( <MessageBlock key={m.id} message={m} /> ));
  }, [messages]);

  const queueMessageNodes = useMemo(() => {
    return queueMessages.map((m) => <QueueMessageBlock key={m.id} message={m} />)
  }, [queueMessages]);

  const retryConnection = () => {
    setConnectFailed(false);
    setConnStatus("reconnecting");
    reconnectStepRef.current = 0;
    closedByUsRef.current = false;
    connect();
  };

  const dismissConnectError = () => {
    setConnectFailed(false);
    setConnStatus("reconnecting");
    reconnectStepRef.current = 0;
    closedByUsRef.current = false;
    connect();
  };

  return (
    <div className="flex h-dvh flex-col">
      <HeaderBlock
        datasetName={datasetMeta?.name}
        totalRows={datasetMeta?.total_rows}
        indicator={
          <ConnectionIndicator
            status={connStatus}
            countdown={reconnectCountdown}
            attempt={reconnectAttempt}
          />
        }
      />
      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-6">
        <div ref={sentinelRef} aria-hidden className="h-px w-full" />
        {messages.length === 0 && (
          <SuggestionBlock handleSend={handleSend} disabled={disableSendBtn} />
        )}

        <AnimatePresence>
          {loadingMore && <LoadMore/>}
        </AnimatePresence>

        {messageNodes}
        {streaming && <StreamingDots status={status as string} />}
        {queueMessageNodes}
        <InputBlock
         placeholder="Ask about your data… (e.g. average revenue by region, top 5)" handleSend={handleSend} disableSendBtn={disableSendBtn} inputValue={inputValue} setInputValue={setInputValue}
         />

      </div>

      {connectFailed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative mx-4 w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center shadow-xl">
            <button
              onClick={dismissConnectError}
              aria-label="Dismiss"
              className="absolute right-3 top-2 text-lg text-slate-500 hover:text-slate-300"
            >
              ×
            </button>
            <p className="text-sm text-slate-200">
              Could not connect to server. Check your internet connection.
            </p>
            <button
              onClick={retryConnection}
              className="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
