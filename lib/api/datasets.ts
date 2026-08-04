import { api } from "./client";
import type {
  CleaningReport,
  Dataset,
  DatasetProfile,
  MessagesResponse,
  QueryResult,
  RecordsResponse,
  UploadResponse,
} from "@/lib/types";

export const datasetApi = {
  async list(): Promise<{ datasets: Dataset[] }> {
    const res = await api.get("/api/v1/datasets");
    return res.data;
  },

  async get(id: string): Promise<Dataset> {
    const res = await api.get(`/api/v1/datasets/${id}`);
    return res.data;
  },

  async upload(file: File, name: string, description?: string): Promise<UploadResponse> {
    const form = new FormData();
    form.append("file", file);
    form.append("name", name);
    if (description) form.append("description", description);
    const res = await api.post("/api/v1/datasets/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });
    return res.data;
  },

  async delete(id: string) {
    await api.delete(`/api/v1/datasets/${id}`);
  },

  async records(id: string, page = 1, pageSize = 50): Promise<RecordsResponse> {
    const res = await api.get(`/api/v1/datasets/${id}/records`, {
      params: { page, page_size: pageSize },
    });
    return res.data;
  },

  async schema(id: string): Promise<{ schema: Record<string, { type: string; allowed_operators: string[] }> }> {
    const res = await api.get(`/api/v1/datasets/${id}/schema`);
    return res.data;
  },

  async profile(id: string): Promise<DatasetProfile> {
    const res = await api.get(`/api/v1/datasets/${id}/profile`);
    return res.data;
  },

  async query(id: string, plan: Record<string, unknown>): Promise<QueryResult> {
    const res = await api.post(`/api/v1/datasets/${id}/query`, plan);
    return res.data;
  },

  async messages(id: string, page = 1, pageSize = 50): Promise<MessagesResponse> {
    const res = await api.get(`/api/v1/datasets/${id}/messages`, {
      params: { page, page_size: pageSize },
    });
    return res.data;
  },
};

export const cleaningReportKey = (datasetId: string) => `qm:cleaning:${datasetId}`;

export function persistCleaningReport(datasetId: string, report: CleaningReport) {
  try {
    localStorage.setItem(cleaningReportKey(datasetId), JSON.stringify(report));
  } catch {
    /* ignore */
  }
}

export function readCleaningReport(datasetId: string): CleaningReport | null {
  try {
    const raw = localStorage.getItem(cleaningReportKey(datasetId));
    return raw ? (JSON.parse(raw) as CleaningReport) : null;
  } catch {
    return null;
  }
}
