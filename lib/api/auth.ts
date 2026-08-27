import { api } from "./client";
import type { User } from "@/lib/types";

export const authApi = {
  async register(email: string, password: string, confirmPassword: string) {
    const res = await api.post("/api/v1/auth/register", {
      email,
      password,
      confirm_password: confirmPassword,
    });
    return res.data;
  },

  async login(email: string, password: string) {
    const res = await api.post("/api/v1/auth/login", { email, password });
    return res.data;
  },

  async me(): Promise<User> {
    const res = await api.get("/api/v1/auth/me");
    return res.data;
  },

  async exchangeSession(token: string) {
    const res = await api.post("/api/v1/auth/session", { token });
    return res.data;
  },

  async logout() {
    await api.post("/api/v1/auth/logout");
  },

  async verifyEmail(email: string, token: string) {
    const res = await api.post("/api/v1/auth/verify-email", { email, token });
    return res.data;
  },

  async requestVerifyEmail(email: string) {
    const res = await api.post("/api/v1/auth/email", { email });
    return res.data;
  },

  async requestReset(email: string) {
    const res = await api.post("/api/v1/auth/reset-password", { email });
    return res.data;
  },

  async resetPassword(email: string, token: string, password: string, confirmPassword: string) {
    const res = await api.post("/api/v1/auth/reset-password/confirm", {
      email,
      token,
      password,
      confirm_password: confirmPassword,
    });
    return res.data;
  },
};

// export async function getGoogleAuthUrl(): Promise<string> {
//   const res = await api.get("/api/v1/auth/google/url");
//   return res.data.url;
// }

// export const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
//   client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
//   redirect_uri: `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/auth/google-auth`,
//   response_type: "code",
//   prompt: "select_account",
//   access_type: "offline",
//   scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
// }).toString()}`;
