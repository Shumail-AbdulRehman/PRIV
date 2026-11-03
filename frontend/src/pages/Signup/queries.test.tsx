import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ signup: vi.fn(), dispatch: vi.fn(), navigate: vi.fn() }));
vi.mock("./api", () => ({ signUp: mock.signup }));
vi.mock("react-redux", () => ({ useDispatch: () => mock.dispatch }));
vi.mock("react-router-dom", () => ({ useNavigate: () => mock.navigate }));
import { useCreateManager } from "./queries";
const owner = { id: 1, name: "Owner", email: "owner@example.invalid", companyId: 42, role: "ADMIN" };
const form = { name: "Owner", email: "owner@example.invalid", password: "test-password", companyName: "Test" };
beforeEach(() => vi.resetAllMocks());
function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  client.setQueryData(["previous-tenant"], { private: "old-cache" });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { client, ...renderHook(useCreateManager, { wrapper }) };
}
it("does not manufacture authenticated state after account persistence but failed session delivery", async () => {
  mock.signup.mockResolvedValue({ ...owner, sessionEstablished: false });
  const { result, client } = setup();
  await act(async () => { await result.current.mutateAsync(form); });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mock.dispatch).toHaveBeenCalledWith({ type: "auth/clearUser", payload: undefined });
  expect(client.getQueryData(["currentUser"])).toBeUndefined(); expect(client.getQueryData(["previous-tenant"])).toBeUndefined();
  expect(mock.navigate).not.toHaveBeenCalled(); expect(result.current.data?.sessionEstablished).toBe(false);
});
it("keeps existing successful signup behavior when the backend confirms a session", async () => {
  mock.signup.mockResolvedValue({ ...owner, sessionEstablished: true }); const { result, client } = setup();
  await act(async () => { await result.current.mutateAsync(form); });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(client.getQueryData(["currentUser"])).toEqual({ ...owner, sessionEstablished: true });
  expect(mock.dispatch).toHaveBeenCalledWith({ type: "auth/setUser", payload: { ...owner, sessionEstablished: true } });
  expect(mock.navigate).toHaveBeenCalledWith("/choose-plan", { replace: true }); expect(client.getQueryData(["previous-tenant"])).toBeUndefined();
});
it("a failed signup leaves existing auth/cache intact and never redirects", async () => {
  mock.signup.mockRejectedValue(new Error("duplicate account")); const { result, client } = setup();
  await act(async () => { await expect(result.current.mutateAsync(form)).rejects.toThrow("duplicate account"); });
  expect(mock.navigate).not.toHaveBeenCalled(); expect(mock.dispatch).not.toHaveBeenCalled(); expect(client.getQueryData(["previous-tenant"])).toBeDefined();
});
