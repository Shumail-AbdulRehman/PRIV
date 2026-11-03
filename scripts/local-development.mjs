#!/usr/bin/env node
import { execFile, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, readFile, readdir, realpath, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { setTimeout as delay } from 'node:timers/promises';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const configPath = join(homedir(), '.local/share/hygene-ops/local-development/config.json');
const execute = promisify(execFile);
// Explicit local demo fixture only; never a provider catalog or checkout credential.
export const LOCAL_DEMO_PRICE_CATALOG = JSON.stringify([
  { plan: 'PRO', interval: 'month', priceId: `pri_localdemo${'0'.repeat(17)}` },
]);
const allowedEnvironment = new Set([
  'DATABASE_URL', 'DIRECT_URL', 'NODE_ENV', 'PORT', 'TZ', 'FRONTEND_URL',
  'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET', 'ACCESS_TOKEN_EXPIRY',
  'REFRESH_TOKEN_EXPIRY', 'STAFF_REFRESH_TOKEN_EXPIRY', 'VERIFICATION_QR_SECRET',
  'VERIFICATION_SLOT_SECRET', 'COOKIE_SECURE', 'COOKIE_SAME_SITE',
  'PADDLE_BILLING_ENABLED', 'PADDLE_ENVIRONMENT', 'STAFF_PUSH_ENABLED',
  'PADDLE_PRICE_CATALOG_JSON', 'EXPO_PUSH_ACCESS_TOKEN', 'GOOGLE_APPLICATION_CREDENTIALS',
  // Browser Maps settings are explicitly configured; no provider/server credentials are inherited.
  'GOOGLE_MAP_API_KEY', 'GOOGLE_MAP_BROWSER_API_KEY', 'GOOGLE_MAP_ID',
]);
const disabledEnvironment = [
  'EXPO_PUSH_ACCESS_TOKEN', 'GOOGLE_APPLICATION_CREDENTIALS',
];
class LocalDevelopmentError extends Error {}

/** This launcher owns only the previously restored local development database. */
export function assertLocalDatabase(value) {
  let url;
  try { url = new URL(value); } catch { throw new LocalDevelopmentError('A local database URL is required'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || url.hostname !== '127.0.0.1' ||
      url.port !== '56445' || url.pathname !== '/hygene_ops_local' || url.search || url.hash) {
    throw new LocalDevelopmentError('Only the existing local development database is allowed');
  }
}

export function validateConfig(config, backend = join(repository, 'backend')) {
  if (!config || typeof config !== 'object' || !config.env || typeof config.env !== 'object') {
    throw new LocalDevelopmentError('Private local development configuration is required');
  }
  for (const key of ['directory', 'backend', 'bin', 'lib', 'pgdata', 'pglog']) {
    if (typeof config[key] !== 'string' || !isAbsolute(config[key])) {
      throw new LocalDevelopmentError(`Private configuration requires an absolute ${key} path`);
    }
  }
  if (resolve(config.backend) !== resolve(backend) || resolve(config.directory) === resolve(backend)) {
    throw new LocalDevelopmentError('Local configuration points to a different checkout');
  }
  if (config.env.NODE_ENV !== 'development' || config.env.PADDLE_BILLING_ENABLED !== 'false' ||
      config.env.STAFF_PUSH_ENABLED !== 'false' || config.env.PADDLE_ENVIRONMENT !== 'sandbox') {
    throw new LocalDevelopmentError('Only development mode with external billing and push disabled is allowed');
  }
  for (const [key, value] of Object.entries(config.env)) {
    if (!allowedEnvironment.has(key) || typeof value !== 'string' ||
        (disabledEnvironment.includes(key) && value !== '') ||
        (key === 'PADDLE_PRICE_CATALOG_JSON' && value !== '' && value !== LOCAL_DEMO_PRICE_CATALOG)) {
      throw new LocalDevelopmentError('Unsupported local environment setting; external credentials must remain disabled');
    }
  }
  for (const key of ['DATABASE_URL', 'DIRECT_URL']) assertLocalDatabase(config.env[key]);
  if (!/^\d+$/.test(config.env.PORT ?? '') || Number(config.env.PORT) < 1024 || Number(config.env.PORT) > 65535) {
    throw new LocalDevelopmentError('Choose an unprivileged local backend port');
  }
  for (const key of ['ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET', 'VERIFICATION_QR_SECRET', 'VERIFICATION_SLOT_SECRET']) {
    if (!config.env[key]?.trim()) throw new LocalDevelopmentError(`Missing local signing setting: ${key}`);
  }
  return config;
}

/** Deliberately never spread process.env or parse a checkout .env. */
export function childEnvironment(config) {
  return {
    ...config.env,
    PATH: `${dirname(process.execPath)}:/usr/bin:/bin`,
    HOME: config.directory,
    LANG: 'C.UTF-8',
    LD_LIBRARY_PATH: config.lib,
    DOTENV_CONFIG_PATH: '/dev/null',
    DOTENV_CONFIG_QUIET: 'true',
  };
}

export async function assertBuildFreshness(backend) {
  const visit = async (directory) => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const source = join(directory, entry.name);
      if (entry.isDirectory()) await visit(source);
      else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
        const compiled = join(backend, 'dist', source.slice(join(backend, 'src').length + 1).replace(/\.ts$/, '.js'));
        const [input, output] = await Promise.all([stat(source), stat(compiled).catch(() => null)]);
        if (!output || input.mtimeMs > output.mtimeMs) throw new LocalDevelopmentError('Backend build is stale; build this checkout before starting');
      }
    }
  };
  await visit(join(backend, 'src'));
  if ((await stat(join(backend, 'prisma/schema.prisma'))).mtimeMs > (await stat(join(backend, 'dist/app.js'))).mtimeMs) {
    throw new LocalDevelopmentError('Backend build predates the Prisma schema; rebuild this checkout');
  }
}

export async function migrationChecksums(backend) {
  const directory = join(backend, 'prisma/migrations');
  const names = (await readdir(directory, { withFileTypes: true }))
    .filter(entry => entry.isDirectory() && /^\d/.test(entry.name)).map(entry => entry.name).sort();
  if (!names.length) throw new LocalDevelopmentError('Repository migrations are missing');
  return Promise.all(names.map(async name => ({
    name,
    checksum: createHash('sha256').update(await readFile(join(directory, name, 'migration.sql'))).digest('hex'),
  })));
}

export function assertMigrationCompatibility(expected, rows) {
  if (rows.length !== expected.length || expected.some(migration => {
    const row = rows.find(item => item.migration_name === migration.name);
    return !row || !row.finished_at || row.rolled_back_at || row.checksum !== migration.checksum;
  })) {
    throw new LocalDevelopmentError('Local database migrations do not match this checkout; no migration was applied');
  }
}

export async function verifyMigrations(config, ClientType) {
  const expected = await migrationChecksums(config.backend);
  const require = createRequire(join(config.backend, 'package.json'));
  const Client = ClientType ?? require('pg').Client;
  const client = new Client({ connectionString: config.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    await client.query('BEGIN READ ONLY');
    await client.query("SET LOCAL statement_timeout = '5s'");
    const { rows } = await client.query('SELECT migration_name, checksum, finished_at, rolled_back_at FROM "_prisma_migrations"');
    assertMigrationCompatibility(expected, rows);
    await client.query('COMMIT');
    return expected.length;
  } finally {
    await client.end();
  }
}

/** Availability only: backend startup separately checks its build and migrations. */
export async function waitForDatabase(config, ClientType, { timeoutMs = 20_000, retryMs = 250 } = {}) {
  const require = createRequire(join(config.backend, 'package.json'));
  const Client = ClientType ?? require('pg').Client;
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const timeout = Math.max(1, Math.min(1000, deadline - Date.now()));
    const client = new Client({
      connectionString: config.env.DATABASE_URL, connectionTimeoutMillis: timeout,
      query_timeout: timeout, options: '-c default_transaction_read_only=on',
    });
    try {
      await client.connect();
      await client.query('SELECT 1');
      return;
    } catch (error) {
      const availabilityFailure = ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', '57P03'].includes(error.code) ||
        ['timeout expired', 'Connection terminated due to connection timeout', 'Query read timeout'].includes(error.message);
      if (!availabilityFailure) throw error;
    } finally {
      await client.end();
    }
    if (Date.now() >= deadline) throw new LocalDevelopmentError('Local database did not become ready before the startup deadline');
    await delay(Math.min(retryMs, deadline - Date.now()));
  }
}

async function loadConfig() {
  const config = validateConfig(JSON.parse(await readFile(configPath, 'utf8')));
  if (await realpath(config.backend) !== await realpath(join(repository, 'backend'))) {
    throw new LocalDevelopmentError('Local backend resolved to a different checkout');
  }
  try {
    await access(join(config.directory, '.env'));
  } catch (error) {
    if (error.code === 'ENOENT') return config;
    throw error;
  }
  throw new LocalDevelopmentError('The private runtime directory must not contain a .env file');
}

export async function databaseCommand(config) {
  if ((await readFile(join(config.pgdata, 'PG_VERSION'), 'utf8')).trim() !== '17') {
    throw new LocalDevelopmentError('Only the existing PostgreSQL 17 data directory is allowed');
  }
  return [join(config.bin, 'postgres'), [
    '-D', config.pgdata, '-h', '127.0.0.1', '-p', '56445', '-k', config.directory,
    '-c', 'jit=off', '-c', 'listen_addresses=127.0.0.1',
  ]];
}

async function runChild(command, args, config) {
  const child = spawn(command, args, { cwd: config.directory, env: childEnvironment(config), stdio: 'inherit' });
  const forward = signal => child.kill(signal);
  const interrupt = () => forward('SIGINT');
  const terminate = () => forward('SIGTERM');
  process.on('SIGINT', interrupt);
  process.on('SIGTERM', terminate);
  try {
    return await new Promise((done, reject) => {
      child.once('error', reject);
      child.once('exit', (code, signal) => done(code ?? (signal === 'SIGTERM' || signal === 'SIGINT' ? 0 : 1)));
    });
  } finally {
    process.off('SIGINT', interrupt);
    process.off('SIGTERM', terminate);
  }
}

async function main(command) {
  if (!['check', 'database', 'database-ready', 'backend'].includes(command)) throw new LocalDevelopmentError('Usage: node scripts/local-development.mjs check|database|database-ready|backend');
  const config = await loadConfig();
  if (command === 'database') {
    const [executable, args] = await databaseCommand(config);
    return runChild(executable, args, config);
  }
  if (command === 'database-ready') {
    await waitForDatabase(config);
    return 0;
  }
  await assertBuildFreshness(config.backend);
  const migrations = await verifyMigrations(config);
  if (command === 'check') {
    const options = { cwd: repository, env: { PATH: '/usr/bin:/bin', LANG: 'C.UTF-8' } };
    const [head, branch] = await Promise.all([
      execute('git', ['rev-parse', 'HEAD'], options),
      execute('git', ['branch', '--show-current'], options),
    ]);
    console.log(JSON.stringify({ root: repository, revision: head.stdout.trim(), branch: branch.stdout.trim(), database: '127.0.0.1:56445/hygene_ops_local', migrations }));
    return 0;
  }
  return runChild(process.execPath, [join(config.backend, 'dist/app.js')], config);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv[2]).then(code => { process.exitCode = code; }).catch(error => {
    // Driver/config exceptions can contain credentials; show only known safe guard messages and codes.
    const code = typeof error?.code === 'string' && /^[A-Z0-9_]{2,32}$/.test(error.code) ? ` (${error.code})` : '';
    console.error(error instanceof LocalDevelopmentError ? error.message : `Local development preflight failed${code}; inspect local database availability and private runtime paths.`);
    process.exitCode = 1;
  });
}
