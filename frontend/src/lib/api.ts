import { useAuthStore } from "@/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type FetchOptions = RequestInit & { token?: string };

let refreshPromise: Promise<string | null> | null = null;

async function handleTokenRefresh(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to refresh token");
      const data = await res.json();
      if (data.success && data.data?.accessToken) {
        const { accessToken, user } = data.data;
        useAuthStore.getState().setAuth(accessToken, user);
        return accessToken;
      }
    } catch (err) {
      console.error("Token refresh failed", err);
      useAuthStore.getState().logout();
    } finally {
      refreshPromise = null;
    }
    return null;
  })();

  return refreshPromise;
}

export async function api<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...init } = options;
  let currentToken = token;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers || {}),
  };
  if (currentToken) (headers as Record<string, string>)["Authorization"] = `Bearer ${currentToken}`;

  let res = await fetch(`${API_URL}${endpoint}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (res.status === 401) {
    const freshToken = await handleTokenRefresh();
    if (freshToken) {
      const retryHeaders = {
        ...headers,
        "Authorization": `Bearer ${freshToken}`,
      };
      res = await fetch(`${API_URL}${endpoint}`, {
        ...init,
        headers: retryHeaders,
        credentials: "include",
      });
    }
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export async function uploadApi<T>(endpoint: string, body: FormData, token?: string): Promise<T> {
  let currentToken = token;
  const headers: HeadersInit = {};
  if (currentToken) (headers as Record<string, string>)["Authorization"] = `Bearer ${currentToken}`;

  let res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    body,
    headers,
    credentials: "include",
  });

  if (res.status === 401) {
    const freshToken = await handleTokenRefresh();
    if (freshToken) {
      const retryHeaders = {
        "Authorization": `Bearer ${freshToken}`,
      };
      res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        body,
        headers: retryHeaders,
        credentials: "include",
      });
    }
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Upload failed");
  return data;
}

export const apiClient = {
  get: <T>(url: string, token?: string) => api<T>(url, { method: "GET", token }),
  post: <T>(url: string, body: unknown, token?: string) =>
    api<T>(url, { method: "POST", body: JSON.stringify(body), token }),
  patch: <T>(url: string, body: unknown, token?: string) =>
    api<T>(url, { method: "PATCH", body: JSON.stringify(body), token }),
  delete: <T>(url: string, token?: string) => api<T>(url, { method: "DELETE", token }),
  upload: <T>(url: string, body: FormData, token?: string) => uploadApi<T>(url, body, token),
};
