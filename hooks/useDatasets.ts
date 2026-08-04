"use client";

import { useCallback, useEffect, useState } from "react";
import { datasetApi } from "@/lib/api/datasets";
import type { CleaningReport, Dataset, UploadResponse } from "@/lib/types";

export function useDatasets() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastReport, setLastReport] = useState<{
    report: CleaningReport;
    dataset: Dataset;
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const res = await datasetApi.list();
      setDatasets(res.datasets);
    } catch (err) {
      setError((err as Error).message || "Failed to load datasets");
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function run() {
      try {
        const res = await datasetApi.list();
        if (!ignore) setDatasets(res.datasets);
      } catch (err) {
        if (!ignore) setError((err as Error).message || "Failed to load datasets");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    run();
    return () => {
      ignore = true;
    };
  }, []);

  const upload = useCallback(
    async (file: File, name: string, description?: string): Promise<UploadResponse> => {
      setUploading(true);
      setError(null);
      try {
        const res = await datasetApi.upload(file, name, description);
        setLastReport({ report: res.cleaning_report, dataset: res.dataset });
        await fetchAll();
        return res;
      } finally {
        setUploading(false);
      }
    },
    [fetchAll]
  );

  const remove = useCallback(
    async (id: string) => {
      await datasetApi.delete(id);
      await fetchAll();
    },
    [fetchAll]
  );

  return { datasets, loading, error, uploading, lastReport, upload, remove, fetchAll };
}
