import type { ChatEvent, ChatMessage } from "@/lib/types";
import { refreshSession } from "@/lib/api/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function parseEventData(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return { text: trimmed };
  }
}

export interface ChatStreamHandlers {
  onEvent: (event: ChatEvent) => void;
  onError: (message: string) => void;
  onDone: () => void;
}

export async function streamChat(
  datasetId: string,
  message: string,
  history: { role: "user" | "assistant"; content: string }[],
  handlers: ChatStreamHandlers
): Promise<void> {
  const controller = new AbortController();

  async function postChat(): Promise<Response> {
    return fetch(`${API_URL}/api/v1/chat/${datasetId}/query`, {
      method: "POST",
      credentials: "include",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": document.cookie
          .split("; ")
          .find((c) => c.startsWith("csrf_token="))
          ?.split("=").slice(1).join("=") || "",
      },
      body: JSON.stringify({ message, history }),
    });
  }

  let resp: Response;
  try {
    resp = await postChat();
  } catch {
    handlers.onError("Could not reach the AI assistant. Check your connection and try again.");
    handlers.onDone();
    return;
  }

  if (resp.status === 401) {
    const refreshed = await refreshSession();
    if (refreshed) {
      try {
        resp = await postChat();
      } catch {
        handlers.onError("Could not reach the AI assistant. Check your connection and try again.");
        handlers.onDone();
        return;
      }
    } else {
      handlers.onError("Your session expired. Please log in again.");
      handlers.onDone();
      return;
    }
  }

  if (!resp.ok || !resp.body) {
    let detail = `Request failed (${resp.status})`;
    try {
      const body = await resp.json();
      if (body?.detail) detail = body.detail;
    } catch {
      /* ignore */
    }
    handlers.onError(detail);
    handlers.onDone();
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const handleLine = (line: string) => {
    const data = parseEventData(line);
    if (!data) return;

    try {
      if (data.error) {
        handlers.onEvent({ event: "error", data: { message: String(data.error) } });
      } else if (data.done) {
        handlers.onEvent({ event: "done", data: {} });
      } else if (typeof data.progress === "string") {
        handlers.onEvent({ event: "progress", data: { status: data.progress } });
      } else if (typeof data.delta === "string") {
        handlers.onEvent({ event: "delta", data: { content: data.delta } });
      } else {
        handlers.onEvent({
          event: "message",
          data: {
            id: String(data.id ?? ""),
            role: String(data.role ?? "assistant"),
            type: String(data.type ?? "text"),
            chart_type: data.chart_type ? String(data.chart_type) : undefined,
            is_error: Boolean(data.is_error),
            content: data.content ?? "",
          },
        });
      }
    } catch (eventErr) {
      handlers.onError(
        data.error
          ? String(data.error)
          : "The AI assistant returned an unreadable response. Try again."
      );
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let boundary: number;
      while ((boundary = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 1);
        if (!line.trim()) continue;
        handleLine(line);
      }
    }

    if (buffer.trim()) {
      handleLine(buffer);
      buffer = "";
    }
  } finally {
    controller.abort();
    handlers.onDone();
  }
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
