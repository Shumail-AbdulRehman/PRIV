import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile, utimes } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  assertBuildFreshness, assertLocalDatabase, assertMigrationCompatibility,
  childEnvironment, databaseCommand, migrationChecksums, validateConfig, verifyMigrations, waitForDatabase,
  LOCAL_DEMO_PRICE_CATALOG,
} from './local-development.mjs';

const backend = '/example/current/backend';
const configuration = () => ({
  directory: '/example/private', backend, bin: '/example/private/pgsql/bin',
  lib: '/example/private/pgsql/lib', pgdata: '/example/private/pgdata', pglog: '/example/private/postgres.log',
  env: {
    DATABASE_URL: 'postgresql://local@127.0.0.1:56445/hygene_ops_local',
    DIRECT_URL: 'postgresql://local@127.0.0.1:56445/hygene_ops_local',
    NODE_ENV: 'development', PORT: '8080', PADDLE_BILLING_ENABLED: 'false',
    PADDLE_ENVIRONMENT: 'sandbox', STAFF_PUSH_ENABLED: 'false',
    ACCESS_TOKEN_SECRET: 'synthetic-access', REFRESH_TOKEN_SECRET: 'synthetic-refresh',
    VERIFICATION_QR_SECRET: 'synthetic-qr', VERIFICATION_SLOT_SECRET: 'synthetic-slot',
    EXPO_PUSH_ACCESS_TOKEN: '', GOOGLE_APPLICATION_CREDENTIALS: '', PADDLE_PRICE_CATALOG_JSON: '',
  },
});

test('accepts only the known local database with no connection overrides', () => {
  assert.doesNotThrow(() => assertLocalDatabase(configuration().env.DATABASE_URL));
  for (const url of [
    'postgresql://local@remote.invalid:56445/hygene_ops_local',
    'postgresql://local@127.0.0.1:5432/hygene_ops_local',
    'postgresql://local@127.0.0.1:56445/production',
    'postgresql://local@127.0.0.1:56445/hygene_ops_local?host=remote.invalid',
    'postgresql://local@127.0.0.1:56445/hygene_ops_local#other',
  ]) assert.throws(() => assertLocalDatabase(url), /Only the existing local/);
});

test('rejects another checkout and production or enabled external services', () => {
  assert.doesNotThrow(() => validateConfig(configuration(), backend));
  assert.throws(() => validateConfig({ ...configuration(), backend: '/example/old/backend' }, backend), /different checkout/);
  for (const setting of [{ NODE_ENV: 'production' }, { PADDLE_BILLING_ENABLED: 'true' }, { STAFF_PUSH_ENABLED: 'true' }, { PADDLE_ENVIRONMENT: 'production' }]) {
    const config = configuration();
    Object.assign(config.env, setting);
    assert.throws(() => validateConfig(config, backend), /external billing and push disabled/);
  }
});

test('rejects external credentials and unknown configuration instead of inheriting them', () => {
  for (const key of ['OPENAI_API_KEY', 'CLOUDFLARE_API_TOKEN', 'PADDLE_API_KEY', 'EXPO_PUSH_ACCESS_TOKEN', 'GOOGLE_APPLICATION_CREDENTIALS', 'PADDLE_PRICE_CATALOG_JSON']) {
    const config = configuration();
    config.env[key] = 'synthetic-provider-value';
    assert.throws(() => validateConfig(config, backend), /Unsupported local environment/);
  }
  const previous = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = 'synthetic-inherited-secret';
  try {
    const env = childEnvironment(validateConfig(configuration(), backend));
    assert.equal(env.OPENAI_API_KEY, undefined);
    assert.equal(env.NODE_OPTIONS, undefined);
    assert.equal(env.DOTENV_CONFIG_PATH, '/dev/null');
    assert.equal(env.HOME, configuration().directory);
  } finally {
    if (previous === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previous;
  }
});

test('passes explicitly configured browser Maps settings without importing other provider credentials', () => {
  for (const key of ['GOOGLE_MAP_API_KEY', 'GOOGLE_MAP_BROWSER_API_KEY']) {
    const config = configuration();
    config.env[key] = 'synthetic-browser-map-key';
    config.env.GOOGLE_MAP_ID = 'synthetic-map-id';
    const env = childEnvironment(validateConfig(config, backend));
    assert.equal(env[key], 'synthetic-browser-map-key');
    assert.equal(env.GOOGLE_MAP_ID, 'synthetic-map-id');
    assert.equal(env.PADDLE_API_KEY, undefined);
    assert.equal(env.GOOGLE_APPLICATION_CREDENTIALS, '');
  }
});

test('permits only the explicit local demo catalog while keeping external billing disabled', () => {
  const config = configuration();
  config.env.PADDLE_PRICE_CATALOG_JSON = LOCAL_DEMO_PRICE_CATALOG;
  const env = childEnvironment(validateConfig(config, backend));
  assert.equal(env.PADDLE_PRICE_CATALOG_JSON, LOCAL_DEMO_PRICE_CATALOG);
  assert.equal(env.PADDLE_BILLING_ENABLED, 'false');
  assert.equal(env.PADDLE_ENVIRONMENT, 'sandbox');
  assert.equal(env.PADDLE_API_KEY, undefined);
  for (const catalog of [
    JSON.stringify([{ plan: 'PRO', interval: 'month', priceId: `pri_${'1'.repeat(26)}` }]),
    JSON.stringify([{ ...JSON.parse(LOCAL_DEMO_PRICE_CATALOG)[0], plan: 'ADVANCED' }]),
    JSON.stringify([...JSON.parse(LOCAL_DEMO_PRICE_CATALOG), ...JSON.parse(LOCAL_DEMO_PRICE_CATALOG)]),
  ]) {
    assert.throws(() => validateConfig({ ...config, env: { ...config.env, PADDLE_PRICE_CATALOG_JSON: catalog } }, backend), /Unsupported local environment/);
  }
  for (const setting of [{ PADDLE_ENVIRONMENT: 'production' }, { PADDLE_BILLING_ENABLED: 'true' }]) {
    assert.throws(() => validateConfig({ ...config, env: { ...config.env, ...setting } }, backend), /external billing and push disabled/);
  }
});

test('migration preflight rejects missing, failed, rolled back, changed or additional migrations', () => {
  const expected = [{ name: '001_initial', checksum: 'fixture-sha' }];
  const row = { migration_name: '001_initial', checksum: 'fixture-sha', finished_at: new Date(), rolled_back_at: null };
  assert.doesNotThrow(() => assertMigrationCompatibility(expected, [row]));
  for (const rows of [[], [{ ...row, checksum: 'changed' }], [{ ...row, finished_at: null }], [{ ...row, rolled_back_at: new Date() }], [row, row]]) {
    assert.throws(() => assertMigrationCompatibility(expected, rows), /migrations do not match/);
  }
});

test('checks actual source/build timestamps and hashes actual migration bytes', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'hygene-launcher-test-'));
  try {
    for (const path of ['src', 'dist', 'prisma/migrations/001_initial']) await mkdir(join(directory, path), { recursive: true });
    await writeFile(join(directory, 'src/app.ts'), 'export {};');
    await writeFile(join(directory, 'src/types.d.ts'), 'declare const fixture: string;');
    await writeFile(join(directory, 'prisma/schema.prisma'), 'fixture');
    await writeFile(join(directory, 'prisma/migrations/001_initial/migration.sql'), 'SELECT 1;');
    await assert.rejects(() => assertBuildFreshness(directory), /build is stale/);
    await writeFile(join(directory, 'dist/app.js'), 'export {};');
    await utimes(join(directory, 'dist/app.js'), new Date('2030-01-01'), new Date('2030-01-01'));
    await assertBuildFreshness(directory);
    await utimes(join(directory, 'src/app.ts'), new Date('2031-01-01'), new Date('2031-01-01'));
    await assert.rejects(() => assertBuildFreshness(directory), /build is stale/);
    const [migration] = await migrationChecksums(directory);
    assert.equal(migration.name, '001_initial');
    assert.equal(migration.checksum, '17db4fd369edb9244b9f91d9aeed145c3d04ad8ba6e95d06247f07a63527d11a');
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('database command starts existing PG17 in foreground without init, migration or reset', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'hygene-launcher-pg-'));
  try {
    const config = { ...configuration(), pgdata: directory };
    await writeFile(join(directory, 'PG_VERSION'), '17\n');
    const [command, args] = await databaseCommand(config);
    assert.equal(command, join(config.bin, 'postgres'));
    assert.deepEqual(args.slice(0, 6), ['-D', directory, '-h', '127.0.0.1', '-p', '56445']);
    assert.ok(args.includes('listen_addresses=127.0.0.1'));
    await writeFile(join(directory, 'PG_VERSION'), '16\n');
    await assert.rejects(() => databaseCommand(config), /existing PostgreSQL 17/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('database preflight uses a read-only transaction and closes its connection on mismatch', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'hygene-launcher-readonly-'));
  try {
    await mkdir(join(directory, 'prisma/migrations/001_initial'), { recursive: true });
    await writeFile(join(directory, 'prisma/migrations/001_initial/migration.sql'), 'SELECT 1;');
    const [migration] = await migrationChecksums(directory);
    const queries = [];
    let closed = false;
    let changed = false;
    class ReadOnlyClient {
      async connect() {}
      async query(sql) {
        queries.push(sql);
        return { rows: [{ migration_name: migration.name, checksum: changed ? 'changed' : migration.checksum, finished_at: new Date(), rolled_back_at: null }] };
      }
      async end() { closed = true; }
    }
    const config = { ...configuration(), backend: directory };
    assert.equal(await verifyMigrations(config, ReadOnlyClient), 1);
    assert.deepEqual(queries, [
      'BEGIN READ ONLY', "SET LOCAL statement_timeout = '5s'",
      'SELECT migration_name, checksum, finished_at, rolled_back_at FROM "_prisma_migrations"', 'COMMIT',
    ]);
    assert.equal(closed, true);
    changed = true;
    closed = false;
    await assert.rejects(() => verifyMigrations(config, ReadOnlyClient), /migrations do not match/);
    assert.equal(closed, true);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('database readiness retries startup availability, reads only and closes every attempt', async () => {
  let attempts = 0;
  let closed = 0;
  const queries = [];
  class StartingClient {
    constructor(options) { assert.equal(options.options, '-c default_transaction_read_only=on'); }
    async connect() {
      if (++attempts === 1) throw Object.assign(new Error('starting'), { code: '57P03' });
    }
    async query(sql) { queries.push(sql); }
    async end() { closed++; }
  }
  await waitForDatabase(configuration(), StartingClient, { timeoutMs: 100, retryMs: 1 });
  assert.equal(attempts, 2);
  assert.equal(closed, 2);
  assert.deepEqual(queries, ['SELECT 1']);
});

test('database readiness has a deadline and does not retry authentication/configuration failures', async () => {
  let attempts = 0;
  let code = 'ECONNREFUSED';
  class UnavailableClient {
    async connect() { attempts++; throw Object.assign(new Error('synthetic failure'), { code }); }
    async end() {}
  }
  await assert.rejects(() => waitForDatabase(configuration(), UnavailableClient, { timeoutMs: 0 }), /startup deadline/);
  assert.equal(attempts, 1);
  for (const terminal of ['28P01', '3D000']) {
    code = terminal;
    attempts = 0;
    await assert.rejects(() => waitForDatabase(configuration(), UnavailableClient), error => error.code === terminal);
    assert.equal(attempts, 1);
  }
});
