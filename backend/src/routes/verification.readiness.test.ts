import { expect, it, vi } from 'vitest';
import express from 'express';
import type { AddressInfo } from 'node:net';

vi.mock('../prisma/prisma.js', () => ({ prisma: { $queryRaw: vi.fn().mockResolvedValue([]) } }));
vi.mock('../middlewares/auth.middleware.js', () => ({ verifyJwt: (_req: unknown, _res: unknown, next: () => void) => next() }));
vi.mock('../services/verification-v2/authorization.service.js', () => ({
  requireActiveActor: vi.fn(), requireTaskAccess: vi.fn(), requireOperationalRole: vi.fn(),
}));
import router from './verification.route.js';

it('reports missing migrations while allowing unrelated API routes to continue', async () => {
  const app = express();
  app.use('/api', router);
  app.get('/api/unrelated', (_req, res) => res.json({ available: true }));
  app.post('/api/task-instance/1/start', (_req, res) => res.json({ available: true }));
  app.use((error: any, _req: any, res: any, _next: any) => res.status(error.statusCode ?? 500).json({ code: error.errors?.[0]?.code }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
  try {
    expect((await fetch(`${base}/unrelated`)).status).toBe(200);
    expect((await fetch(`${base}/task-instance/1/start`, { method: 'POST' })).status).toBe(200);
    const manifest = await fetch(`${base}/task-instance/1/verification`);
    expect(manifest.status).toBe(503);
    expect(await manifest.json()).toEqual({ code: 'VERIFICATION_SCHEMA_NOT_READY' });
    const capabilities = await fetch(`${base}/verification-capabilities`);
    expect(capabilities.status).toBe(200);
    expect((await capabilities.json()).data.database.ready).toBe(false);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
