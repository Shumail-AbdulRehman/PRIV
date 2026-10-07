import assert from "node:assert/strict";
import test from "node:test";
import axios, { AxiosError, AxiosHeaders } from "axios";
import { client, configureApiAuth } from "./client";
import { uploadFormData } from "./client";

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
