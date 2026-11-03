import { createHash, randomBytes } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { isAbsolute } from 'node:path';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import type { Request } from 'express';
import { ApiError } from '../utils/ApiError.js';
import type { OperatorPrincipal } from './operatorIdentity.service.js';

export const LOCAL_OPERATOR_COOKIE = 'hygene_local_platform';
export const localOperatorCookieOptions = { httpOnly: true, sameSite: 'strict' as const, secure: false, path: '/api/platform' };
const credentialsInput = z.object({ email: z.string().trim().email().max(254), password: z.string().min(8).refine(value => Buffer.byteLength(value, 'utf8') <= 72) }).strict();
type Credentials = { email: string; passwordHash: string };
const fail = (status: number, message: string) => new ApiError(status, message);
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const loopback = (address?: string) => ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(address ?? '');
export function localOperatorEnvironmentAllowed(env: NodeJS.ProcessEnv) {
  try {
    const db = new URL(env.DATABASE_URL ?? '');
    const database = db.pathname.slice(1);
    return env.NODE_ENV === 'development' && env.LOCAL_PLATFORM_LOGIN_ENABLED === 'true'
      && ['postgres:', 'postgresql:'].includes(db.protocol) && db.hostname === '127.0.0.1'
      && !db.search && !db.hash && ((db.port === '56445' && database === 'hygene_ops_local')
        || /^priv_e2e_test_[a-f0-9]{32}$/.test(database));
  } catch { return false; }
}
function readCredentials(env: NodeJS.ProcessEnv): Credentials {
  const file = env.LOCAL_PLATFORM_CREDENTIAL_FILE;
  if (!file || !isAbsolute(file)) throw Error();
  const info = statSync(file);
  if (!info.isFile() || info.size > 4096 || (info.mode & 0o077) || (process.getuid && info.uid !== process.getuid())) throw Error();
  const value = JSON.parse(readFileSync(file, 'utf8'));
  if (!z.string().email().max(254).safeParse(value.email).success || !/^\$2[aby]\$(10|11|12|13|14)\$[./A-Za-z0-9]{53}$/.test(value.passwordHash ?? '')) throw Error();
  return { email: value.email.toLowerCase(), passwordHash: value.passwordHash };
}
export function createLocalOperatorSessions(deps: {
  env?: () => NodeJS.ProcessEnv; readCredentials?: (env: NodeJS.ProcessEnv) => Credentials; now?: () => number;
} = {}) {
  const sessions = new Map<string, { fingerprint: string; expiresAt: number }>();
  const attempts = new Map<string, { count: number; expiresAt: number }>();
  const now = deps.now ?? Date.now;
  function configuration(req: Request) {
    const env = (deps.env ?? (() => process.env))();
    if (!localOperatorEnvironmentAllowed(env) || !loopback(req.socket?.remoteAddress)) return null;
    try {
      const credentials = (deps.readCredentials ?? readCredentials)(env);
      return { ...credentials, env, fingerprint: hash(credentials.email + ':' + credentials.passwordHash) };
    } catch { return null; }
  }
  function origin(req: Request, env: NodeJS.ProcessEnv, required = false) {
    const value = req.header('Origin');
    if (!value && !required) return;
    try {
      const candidate = new URL(value ?? '');
      const expected = new URL(env.FRONTEND_URL ?? '');
      if (candidate.protocol === 'http:' && ['localhost','127.0.0.1','[::1]'].includes(candidate.hostname)
        && candidate.port === expected.port && candidate.origin === value) return;
    } catch { /* Deny malformed origins. */ }
    throw fail(403, 'Local platform origin required');
  }
  function authenticate(req: Request): OperatorPrincipal | null {
    const config = configuration(req);
    const token = req.cookies?.[LOCAL_OPERATOR_COOKIE];
    if (!config || !token) return null;
    origin(req, config.env, !['GET','HEAD'].includes(req.method));
    if (req.user || req.header('Authorization') || typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) throw fail(401, 'Invalid local platform session');
    const key = hash(token), session = sessions.get(key);
    if (!session || session.expiresAt <= now() || session.fingerprint !== config.fingerprint) {
      sessions.delete(key); throw fail(401, 'Platform session expired. Sign in again.');
    }
    return Object.freeze({ kind: 'PLATFORM_OPERATOR', issuer: 'urn:hygene:local-development', subject: config.email });
  }
  return {
    authenticate,
    status(req: Request) {
      const config = configuration(req);
      if (!config) return { enabled: false, authenticated: false };
      try { const actor = authenticate(req); return { enabled: true, authenticated: !!actor, ...(actor ? { email: actor.subject } : {}) }; }
      catch { return { enabled: true, authenticated: false }; }
    },
    async login(req: Request, raw: unknown) {
      const config = configuration(req);
      if (!config) throw fail(503, 'Local platform sign-in is unavailable');
      origin(req, config.env, true);
      const parsed = credentialsInput.safeParse(raw);
      if (!parsed.success) throw fail(400, 'Enter a valid email and password');
      const key = req.socket.remoteAddress!, at = now();
      for (const [address, value] of attempts) if (value.expiresAt <= at) attempts.delete(address);
      const previous = attempts.get(key);
      if (previous && previous.count >= 5) throw fail(429, 'Too many sign-in attempts. Try again in 15 minutes.');
      attempts.set(key, { count: (previous?.count ?? 0) + 1, expiresAt: previous?.expiresAt ?? at + 15 * 60_000 });
      const correct = await bcrypt.compare(parsed.data.password, config.passwordHash);
      if (!correct || parsed.data.email.toLowerCase() !== config.email) throw fail(401, 'Invalid platform email or password');
      attempts.delete(key);
      for (const [id, value] of sessions) if (value.expiresAt <= at) sessions.delete(id);
      if (sessions.size >= 64) sessions.delete(sessions.keys().next().value!);
      const token = randomBytes(32).toString('base64url'), expiresAt = at + 15 * 60_000;
      sessions.set(hash(token), { fingerprint: config.fingerprint, expiresAt });
      return { token, expiresAt: new Date(expiresAt), email: config.email };
    },
    logout(req: Request) {
      const config = configuration(req);
      if (!config) throw fail(503, 'Local platform sign-in is unavailable');
      origin(req, config.env, true);
      const token = req.cookies?.[LOCAL_OPERATOR_COOKIE];
      if (typeof token === 'string') sessions.delete(hash(token));
    },
  };
}
export const localOperatorSessions = createLocalOperatorSessions();
