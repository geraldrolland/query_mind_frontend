import axios, { AxiosError, AxiosInstance } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? match.split("=").slice(1).join("=") : undefined;
}

let refreshing: Promise<boolean> | null = null;

/**
 * Refresh the auth session by rotating tokens via the refresh-token endpoint.
 * Single-flight: concurrent callers share one request.
 */
export async function refreshSession(): Promise<boolean> {
  if (!refreshing) {
    refreshing = (async () => {
      try {
        await api.post("/api/v1/auth/refresh-token");
        return true;
      } catch {
        return false;
      }
    })();
    try {
      return await refreshing;
    } finally {
      refreshing = null;
    }
  }
  return refreshing;
}

api.interceptors.request.use((config) => {
  const csrf = getCookie("csrf_token");
  if (csrf && !["get", "head", "options"].includes((config.method || "get").toLowerCase())) {
    config.headers["x-csrf-token"] = csrf;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config & { _retried?: boolean }) | undefined;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retried &&
      !original.url?.includes("/auth/login") &&
      !original.url?.includes("/auth/register") &&
      !original.url?.includes("/auth/refresh-token")
    ) {
      original._retried = true;
      const ok = await refreshSession();
      if (ok) {
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);

export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const first = detail[0] as { msg?: string };
      return first?.msg || "Validation error";
    }
    return error.message;
  }
  return "Something went wrong";
}
