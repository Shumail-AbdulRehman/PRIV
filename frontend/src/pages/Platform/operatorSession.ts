import type { QueryClient } from '@tanstack/react-query';

/** Separate from tenant identity, cookies, refresh interceptors and query keys. */
export const operatorQueryScope = ['platform-operator'] as const;
export const operatorSessionStatus = Object.freeze({
  status: 'unavailable' as const,
  reason: 'PROVIDER_HANDOFF_NOT_QUALIFIED' as const,
});

export class OperatorUnavailableError extends Error {
  readonly code = 'OPERATOR_SIGN_IN_UNAVAILABLE';
  constructor() {
    super('Platform sign-in is unavailable');
    this.name = 'OperatorUnavailableError';
  }
}

/**
 * The approved backend accepts separately verified MFA API bearer identities.
 * No browser OIDC provider/PKCE/session adapter has been selected or qualified.
 * Deliberately perform no network request and accept no caller-provided token.
 * Specs33/35 consume this boundary without falling back to the tenant client.
 */
export async function operatorRequest<T>(
  _path: string,
  _options?: { method?: 'GET' | 'POST' | 'PATCH'; body?: unknown; signal?: AbortSignal },
): Promise<T> {
  if (localOperatorLoginEnabled()) return localPlatformRequest<T>('/' + _path.replace(/^\//,''), _options);
  throw new OperatorUnavailableError();
}

/** Local cleanup only: it cannot claim to revoke an unconfigured IdP session. */
export async function clearOperatorSession(queryClient: QueryClient): Promise<void> {
  try {
    await queryClient.cancelQueries({ queryKey: operatorQueryScope });
  } finally {
    queryClient.removeQueries({ queryKey: operatorQueryScope });
  }
}

/** There is no initiated flow whose state, nonce or PKCE can be verified. */
export function rejectOperatorCallback(): 'UNEXPECTED_CALLBACK' {
  // Never decode, persist or promote URL tokens/claims into an operator identity.
  return 'UNEXPECTED_CALLBACK';
}

/** Explicit local build only; never use tenant state as platform authority. */
export function localOperatorLoginEnabled() {
  return import.meta.env.VITE_LOCAL_PLATFORM_LOGIN === 'true'
    && ['localhost','127.0.0.1','[::1]'].includes(window.location.hostname);
}
const localSessionKey = [...operatorQueryScope, 'local-session'];
export { localSessionKey };
export async function localPlatformRequest<T>(path: string, options?: {method?: string;body?: unknown;signal?: AbortSignal}): Promise<T> {
  if (!localOperatorLoginEnabled()) throw new OperatorUnavailableError();
  const base = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/,'') || '/api';
  const target = new URL(base + path, window.location.origin);
  if (!['localhost','127.0.0.1','[::1]'].includes(target.hostname)) throw new OperatorUnavailableError();
  const response = await fetch(target.toString(), {method:options?.method??'GET',credentials:'include',cache:'no-store',signal:options?.signal,
    headers: options?.body === undefined ? undefined : {'Content-Type':'application/json'},body: options?.body === undefined ? undefined : JSON.stringify(options.body)});
  if (!response.ok) {
    const error = Object.assign(new Error('Platform request failed'),{status:response.status});
    throw error;
  }
  return response.json() as Promise<T>;
}
export async function getLocalOperatorSession() {
  return (await localPlatformRequest<{data:{enabled:boolean;authenticated:boolean;email?:string}}>('/platform/session')).data;
}
export async function signInLocalOperator(email:string,password:string) {
  return (await localPlatformRequest<{data:{authenticated:boolean;email:string}}>('/platform/session/login',{method:'POST',body:{email,password}})).data;
}
export async function signOutLocalOperator() {
  await localPlatformRequest('/platform/session/logout',{method:'POST'});
}
