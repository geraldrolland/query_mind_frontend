import { api } from "./client";

export interface ReviewResponse {
  id: string;
  user_id: number;
  comment: string;
  created_at: string;
}

export async function createReview(comment: string): Promise<ReviewResponse> {
  const { data } = await api.post<ReviewResponse>("/api/v1/review/create-review", {
    comment,
  });
  return data;
}
