import type { ChatEvent, ChatMessage } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function wsBaseUrl(): string {
  return API_URL.replace(/^https:/, "wss:").replace(/^http:/, "ws:");
}

export function wsUrl(datasetId: string): string {
  return `${wsBaseUrl()}/api/v1/chat/${datasetId}/query`;
}

function parseEventData(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return { text: trimmed };
  }
}

export type ResumeReply =
  | { kind: "progress"; status: string }
  | { kind: "done" };

export interface ChatSocketHandlers {
  onEvent: (event: ChatEvent) => void;
  onDone: () => void;
  onError: (message: string) => void;
  onResumeReply: (reply: ResumeReply) => void;
  onOpen?: () => void;
}

export function createChatSocket(
  datasetId: string,
  handlers: ChatSocketHandlers
): WebSocket {
  const socket = new WebSocket(wsUrl(datasetId));
  let resumePending = true;

  const dispatchData = (data: unknown) => {
    const parsed = parseEventData(String(data ?? ""));
    if (!parsed) return;
    try {
      if (parsed.error) {
        handlers.onEvent({ event: "error", data: { message: String(parsed.error) } });
      } else if (parsed.done) {
        handlers.onDone();
      } else if (parsed.pong === 1) {
        return; // liveness heartbeat
      } else if (typeof parsed.progress === "string") {
        handlers.onEvent({ event: "progress", data: { status: parsed.progress } });
      } else if (typeof parsed.delta === "string") {
        handlers.onEvent({ event: "delta", data: { content: parsed.delta } });
      } else {
        const msgData = {
          id: String(parsed.id ?? ""),
          role: String(parsed.role ?? "assistant"),
          type: String(parsed.type ?? "text"),
          chart_type: parsed.chart_type ? String(parsed.chart_type) : undefined,
          is_error: Boolean(parsed.is_error),
          content: parsed.content ?? "",
        };
        console.log("[chat] dispatch message:", msgData.id, "content-len:", String(msgData.content).length);
        handlers.onEvent({ event: "message", data: msgData });
      }
    } catch {
      handlers.onError(
        parsed.error
          ? String(parsed.error)
          : "The AI assistant returned an unreadable response. Try again."
      );
    }
  };

  socket.onopen = () => {
    handlers.onOpen?.();
  };

  socket.onmessage = (event) => {
    const raw = String(event.data ?? "");
    console.log("[chat] frame:", raw.slice(0, 200));
    const parsed = parseEventData(raw);
    if (!parsed) return;
    if (resumePending) {
      if (parsed.pong === 1) return; // keep waiting for the resume state
      resumePending = false;
      if (parsed.done) {
        handlers.onResumeReply({ kind: "done" });
        return;
      }
      if (typeof parsed.progress === "string") {
        handlers.onResumeReply({ kind: "progress", status: parsed.progress });
        return;
      }
      dispatchData(parsed);
      return;
    }
    dispatchData(parsed);
  };

  socket.onerror = () => {
    /* close handler reports the failure */
  };

  return socket;
}

export function messageToHistory(messages: ChatMessage[]): { role: "user" | "assistant"; content: string }[] {
  return messages
    .filter(
      (m) =>
        m.role === "user" ||
        (m.role === "assistant" &&
          !m.is_error &&
          m.content &&
          (m.type !== "record"))
    )
    .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content }));
}