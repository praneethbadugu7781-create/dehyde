const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type FetchOptions = RequestInit & { token?: string };

export async function api<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...init } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers || {}),
  };
  if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...init,
    headers,
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export async function uploadApi<T>(endpoint: string, body: FormData, token?: string): Promise<T> {
  const headers: HeadersInit = {};
  if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    body,
    headers,
    credentials: "include",
  });

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
