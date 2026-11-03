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
  void _path;
  void _options;
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
