export interface User {
  id: number;
  email: string;
  auth_provider: string;
}

export interface Dataset {
  id: string;
  name: string;
  description?: string | null;
  populated: boolean;
  total_rows: number;
  total_size_bytes: number;
  created_at: string;
  updated_at: string;
}

export interface CleaningReport {
  raw_rows: number;
  rows_ingested: number;
  duplicates_removed: number;
  null_counts: Record<string, number>;
  columns: Record<string, string>;
}

export interface UploadResponse {
  dataset: Dataset;
  cleaning_report: CleaningReport;
}

export interface DatasetRow {
  id: string;
  data: Record<string, unknown>;
  created_at: string;
}

export interface RecordsResponse {
  records: DatasetRow[];
  total: number;
  page: number;
  page_size: number;
}

export interface ProfileColumn {
  name: string;
  type: string;
  min?: unknown;
  max?: unknown;
  avg?: number;
  top_values?: string[];
  nulls: number;
}

export interface DatasetProfile {
  dataset_id: string;
  row_count: number;
  columns: ProfileColumn[];
  quality: { columns_with_nulls: number };
  sample_rows: Record<string, unknown>[];
}

export interface QueryResult {
  data: Record<string, unknown>[];
  cached?: boolean;
}

export type ChatEvent =
  | {
      event: "message";
      data: {
        id: string;
        role: string;
        type: string;
        chart_type?: string;
        is_error?: boolean;
        content: unknown;
      };
    }
  | { event: "progress"; data: { status: string } }
  | { event: "delta"; data: { content: string } }
  | { event: "done"; data: Record<string, never> }
  | { event: "error"; data: { message: string } };

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "record";
  chartType?: string;
  record?: Record<string, unknown>;
  error?: string;
  is_error?: boolean;
}

export interface DatasetMessage {
  id: string;
  dataset_id: string;
  content: string;
  role: "user" | "assistant";
  type: string;
  chart_type: string;
  is_error: boolean;
  created_at: string;
}

export interface MessagesResponse {
  messages: DatasetMessage[];
  total: number;
  page: number;
  page_size: number;
}
