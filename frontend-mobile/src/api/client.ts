import axios, { AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "../config";
import type { AuthTokens } from "../types";

type ApiAuthBridge = {
  getTokens: () => Promise<AuthTokens>;
  setTokens: (tokens: Required<AuthTokens>) => Promise<void>;
  clearSession: () => Promise<void>;
};

let authBridge: ApiAuthBridge | null = null;

export const configureApiAuth = (bridge: ApiAuthBridge) => {
  authBridge = bridge;
};

const isFormData = (value: unknown): value is FormData =>
  typeof FormData !== "undefined" && value instanceof FormData;

const setHeader = (
  config: InternalAxiosRequestConfig,
  key: string,
  value: string | null
) => {
  if (!value) {
    return;
  }

  if (config.headers instanceof AxiosHeaders) {
    config.headers.set(key, value);
    return;
  }

  const headers = AxiosHeaders.from(config.headers);
  headers.set(key, value);
  config.headers = headers;
};

const removeHeader = (config: InternalAxiosRequestConfig, key: string) => {
  if (config.headers instanceof AxiosHeaders) {
    config.headers.delete(key);
    return;
  }

  if (!config.headers) {
    return;
  }

  const headers = AxiosHeaders.from(config.headers);
  headers.delete(key);
  config.headers = headers;
};

export const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

client.interceptors.request.use(async (config) => {
  const tokens = await authBridge?.getTokens();

  if (tokens?.accessToken) {
    setHeader(config, "Authorization", `Bearer ${tokens.accessToken}`);
  }

  if (isFormData(config.data)) {
    removeHeader(config, "Content-Type");
  } else if (!AxiosHeaders.from(config.headers).has("Content-Type")) {
    setHeader(config, "Content-Type", "application/json");
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!authBridge || !originalRequest) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/common/refresh-token")) {
      await authBridge.clearSession();
      return Promise.reject(error);
    }

    if (
      error.response?.status !== 401 ||
      error.response?.data?.message !== "Access Token Expired" ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    const tokens = await authBridge.getTokens();

    if (!tokens.refreshToken) {
      await authBridge.clearSession();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshResponse = await axios.post(
        `${API_BASE_URL}/common/refresh-token`,
        {
          refreshToken: tokens.refreshToken,
        }
      );

      const nextTokens = {
        accessToken: refreshResponse.data.data.accessToken as string,
        refreshToken: refreshResponse.data.data.refreshToken as string,
      };

      await authBridge.setTokens(nextTokens);
      setHeader(originalRequest, "Authorization", `Bearer ${nextTokens.accessToken}`);

      return client(originalRequest);
    } catch (refreshError) {
      await authBridge.clearSession();
      return Promise.reject(refreshError);
    }
  }
);

/**
 * Use native `fetch` for multipart FormData uploads.
 * Axios 1.x cannot reliably send React Native file parts ({uri,name,type}),
 * so we bypass it entirely for uploads.
 */
export const uploadFormData = async <T = unknown>(
  path: string,
  formData: FormData
): Promise<T> => {
  const tokens = await authBridge?.getTokens();
  const headers: Record<string, string> = {};

  if (tokens?.accessToken) {
    headers["Authorization"] = `Bearer ${tokens.accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  const json = await response.json();

  if (!response.ok) {
    // Shape the error so callers can read `error.response.data.message`
    const err: any = new Error(json?.message ?? "Request failed");
    err.response = { status: response.status, data: json };
    throw err;
  }

  return json as T;
};
