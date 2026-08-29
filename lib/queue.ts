import type { ChatMessage } from "./types";

const QUEUE_KEY_PREFIX = "queuedMsgs";

export function readQueue(datasetId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(`${QUEUE_KEY_PREFIX}:${datasetId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export function writeQueue(queue: ChatMessage[], datasetId: string) {
  try {
    localStorage.setItem(`${QUEUE_KEY_PREFIX}:${datasetId}`, JSON.stringify(queue));
  } catch {
    /* ignore */
  }
}

export const clearQueue = (datasetId: string): void => {
  try {
    localStorage.removeItem(`${QUEUE_KEY_PREFIX}:${datasetId}`);
  } catch {
    /* ignore */
  }
}

export const popQueueMsg = (inFlightId: string, datasetId: string): void => {
  writeQueue(readQueue(datasetId).filter((m) => m.id !== inFlightId), datasetId);
};

export const getInflightId = (datasetId: string): string | null => {
  try {
    return localStorage.getItem(`inflight_id:${datasetId}`);
  } catch {
    return null;
  }
};

export const setInflightId = (msgSuffix: string, datasetId: string): void => {
  try {
    localStorage.setItem(`inflight_id:${datasetId}`, msgSuffix);
  } catch {
    /* ignore */
  }
};

export const removeInflightId = (datasetId: string): void => {
  try {
    localStorage.removeItem(`inflight_id:${datasetId}`);
  } catch {
    /* ignore */
  }
};
