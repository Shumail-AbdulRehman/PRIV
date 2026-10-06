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

let refreshInFlight: Promise<Required<AuthTokens>> | null = null;
export const refreshApiTokens = (): Promise<Required<AuthTokens>> => {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    if (!authBridge) throw new Error("Sign in again to upload saved photos.");
    const bridge = authBridge;
    const tokens = await bridge.getTokens();
    if (!tokens.refreshToken) throw new Error("Sign in again to upload saved photos.");
    try {
      const response = await axios.post(`${API_BASE_URL}/common/refresh-token`, { refreshToken: tokens.refreshToken }, { timeout: 20000 });
      const nextTokens = { accessToken: response.data.data.accessToken as string, refreshToken: response.data.data.refreshToken as string };
      if ((await bridge.getTokens()).refreshToken !== tokens.refreshToken) throw new Error("Account changed during token refresh.");
      await bridge.setTokens(nextTokens);
      return nextTokens;
    } catch (error) {
      if (axios.isAxiosError(error) && [401,403].includes(error.response?.status ?? 0)
        && (await bridge.getTokens()).refreshToken === tokens.refreshToken) await bridge.clearSession();
      throw error;
    }
  })().finally(() => { refreshInFlight = null; });
  return refreshInFlight;
};
client.interceptors.response.use(response => response, async error => {
  const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
  if (!original || error.response?.status !== 401 || original._retry || original.url?.includes("/common/refresh-token")) throw error;
  original._retry = true;
  const tokens = await refreshApiTokens();
  setHeader(original, "Authorization", `Bearer ${tokens.accessToken}`);
  return client(original);
});

/** Rebuild multipart after refresh; native fetch supports React Native file parts. */
export const uploadFormData = async <T = unknown>(path: string, input: FormData | (() => FormData), timeoutMs = 20000): Promise<T> => {
  for (let retry = 0; retry < 2; retry++) {
    const tokens = await authBridge?.getTokens();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST", headers: tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {},
        body: typeof input === "function" ? input() : input, signal: controller.signal,
      });
      if (response.status === 401 && retry === 0) { await refreshApiTokens(); continue; }
      const json = await response.json();
      if (!response.ok) {
        const error = new Error(json?.message ?? "Request failed") as Error & { response: unknown };
        error.response = { status: response.status, data: json, headers: { 'retry-after': response.headers.get('Retry-After') } };
        throw error;
      }
      return json as T;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") throw new Error("Upload timed out. Your saved photo will retry.");
      throw error;
    } finally { clearTimeout(timeout); }
  }
  throw new Error("Sign in again to upload your saved photos.");
};
