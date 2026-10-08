import assert from "node:assert/strict";
import test from "node:test";
import axios, { AxiosError, AxiosHeaders } from "axios";
import { client, configureApiAuth, configureNativeAppVersion } from "./client";
import { uploadFormData } from "./client";

test('native version reaches session requests and uploads consistently, including stale request headers', async () => {
  const savedAdapter = client.defaults.adapter;
  const savedFetch = globalThis.fetch;
  configureApiAuth({getScope:()=>null,getTokens:async()=>({accessToken:null,refreshToken:null}),setTokens:async()=>{},clearSession:async()=>{}});
  const sent: string[] = [];
  client.defaults.adapter = async config => {
    assert.equal(AxiosHeaders.from(config.headers).get('X-Hygene-Workflow'), '2');
    sent.push(String(AxiosHeaders.from(config.headers).get('X-Hygene-App-Version')));
    return {data:{},status:200,statusText:'OK',headers:{},config};
  };
  globalThis.fetch = async (_url, options) => {
    const headers = new Headers(options?.headers);
    assert.equal(headers.get('X-Hygene-Workflow'), '2');
    sent.push(String(headers.get('X-Hygene-App-Version')));
    return new Response(JSON.stringify({data:{}}),{status:200});
  };
  try {
    configureNativeAppVersion('2.0.0');
    await client.post('/task-instance/1/capture-sessions');
    await client.post('/capture-session/test/resume', {}, {headers:{'X-Hygene-App-Version':'0.0.0'}});
    await uploadFormData('/capture-session/test/attempts',()=>new FormData());
    assert.deepEqual(sent,['2.0.0','2.0.0','2.0.0']);
    configureNativeAppVersion(null);
    await client.post('/task-instance/1/capture-sessions');
    assert.equal(sent.at(-1),'0.0.0','an unknown native version must still fail the server gate');
  } finally {
    configureNativeAppVersion(null);
    client.defaults.adapter = savedAdapter;
    globalThis.fetch = savedFetch;
  }
});

test("login rejection preserves the server error without refreshing a session", async () => {
  const savedAdapter = client.defaults.adapter;
  const savedPost = axios.post;
  let refreshCalls = 0;
  let accessToken: string | null = null;
  configureApiAuth({
    getScope: () => null,
    getTokens: async () => ({ accessToken, refreshToken: null }),
    setTokens: async () => { throw new Error("Login must not refresh tokens"); },
    clearSession: async () => { throw new Error("Login must not clear a session"); },
  });
  axios.post = (async () => {
    refreshCalls++;
    throw new Error("Unexpected refresh");
  }) as typeof axios.post;
  client.defaults.adapter = async config => {
    assert.equal(AxiosHeaders.from(config.headers).get("Authorization"), undefined);
    throw new AxiosError("Request failed with status code 401", "ERR_BAD_REQUEST", config, {}, {
      status: 401, statusText: "Unauthorized", config,
      headers: {}, data: { message: "Invalid email or password" },
    });
  };
  try {
    for (const token of [null, "stale-access-token"]) {
      accessToken = token;
      await assert.rejects(client.post("/staff/staff-login", { email: "staff@example.com", password: "wrong" }), error => {
        assert.ok(axios.isAxiosError(error));
        assert.equal(error.response?.status, 401);
        assert.equal(error.response?.data.message, "Invalid email or password");
        return true;
      });
    }
    assert.equal(refreshCalls, 0);
  } finally {
    client.defaults.adapter = savedAdapter;
    axios.post = savedPost;
  }
});

test("responses arriving after an account switch cannot restore the old user or acknowledge an upload", async () => {
  const savedAdapter = client.defaults.adapter;
  const savedFetch = globalThis.fetch;
  let scope = '1_1';
  configureApiAuth({
    getScope: () => scope,
    getTokens: async () => ({ accessToken: 'access', refreshToken: 'refresh' }),
    setTokens: async () => {}, clearSession: async () => {},
  });
  client.defaults.adapter = async config => {
    scope = '1_2';
    return { data: { data: { id: 1 } }, status: 200, statusText: 'OK', headers: {}, config };
  };
  globalThis.fetch = async () => {
    scope = '1_2';
    return new Response(JSON.stringify({ data: { attemptId: 'attempt', assetId: 'asset' } }), { status: 202 });
  };
  try {
    await assert.rejects(client.get('/common/get-current-user'), /Account changed/);
    scope = '1_1';
    client.defaults.adapter = async config => {
      scope = '1_2';
      throw new AxiosError('Forbidden', 'ERR_BAD_REQUEST', config, {}, {
        status: 403, statusText: 'Forbidden', config, headers: {}, data: { message: 'Revoked' },
      });
    };
    await assert.rejects(client.get('/common/get-current-user'), /Account changed/);
    scope = '1_1';
    await assert.rejects(uploadFormData('/capture-session/session/captures', () => new FormData()), /Account changed/);
  } finally {
    client.defaults.adapter = savedAdapter;
    globalThis.fetch = savedFetch;
  }
});
