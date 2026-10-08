import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { unlockQueue, lockQueue, cleanPreviousProcessCaptureCache } from "../verification/queue";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { client, configureApiAuth } from "../api/client";
import { STORAGE_KEY } from "../config";
import { loadServerAddress } from '../api/serverAddress';
import type { ApiEnvelope, AuthSession, AuthTokens, StaffUser } from "../types";

type AuthContextValue = {
  user: StaffUser | null;
  isBootstrapping: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
};

const emptySession: AuthSession = {
  user: null,
  accessToken: null,
  refreshToken: null,
};

const AuthContext = createContext<AuthContextValue | null>(null);

const persistSession = async (session: AuthSession) => {
  if (!session.user || !session.accessToken || !session.refreshToken) {
    await AsyncStorage.removeItem(STORAGE_KEY);
    if (Platform.OS !== "web") await SecureStore.deleteItemAsync(STORAGE_KEY);
    return;
  }

  if (Platform.OS === "web") await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  else {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(session), { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
};

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<AuthSession>(emptySession);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const sessionRef = useRef<AuthSession>(emptySession);

  const applySession = async (nextSession: AuthSession) => {
    sessionRef.current = nextSession;
    setSession(nextSession);
    await persistSession(nextSession);
  };

  const clearSession = async () => {
    await lockQueue();
    await applySession(emptySession);
    queryClient.clear();
  };

  const updateTokens = async (tokens: Required<AuthTokens>) => {
    const nextSession = {
      ...sessionRef.current,
      ...tokens,
    };

    await applySession(nextSession);
  };

  const refreshCurrentUser = async () => {
    const response = await client.get<ApiEnvelope<StaffUser>>("/common/get-current-user");
    await applySession({
      ...sessionRef.current,
      user: response.data.data,
    });
  };

  useEffect(() => {
    configureApiAuth({
      getScope: () => sessionRef.current.user ? `${sessionRef.current.user.companyId}_${sessionRef.current.user.id}` : null,
      getTokens: async () => ({
        accessToken: sessionRef.current.accessToken,
        refreshToken: sessionRef.current.refreshToken,
      }),
      setTokens: updateTokens,
      clearSession,
    });

    void (async () => {
      try {
        await loadServerAddress();
        if(Platform.OS !== "web") { try { cleanPreviousProcessCaptureCache(); } catch { /* Normal per-capture cleanup also runs. */ } }
        const legacy = await AsyncStorage.getItem(STORAGE_KEY);
        const storedSession = Platform.OS === "web" ? legacy : (await SecureStore.getItemAsync(STORAGE_KEY)) ?? legacy;

        if (!storedSession) {
          setIsBootstrapping(false);
          return;
        }

        const parsed = JSON.parse(storedSession) as AuthSession;
        sessionRef.current = parsed;
        setSession(parsed);
        await persistSession(parsed);
        if (Platform.OS !== "web" && parsed.user) {
          try { await unlockQueue(parsed.user); } catch { /* Camera flow explains unsupported native build. */ }
        }

        if (parsed.accessToken) {
          await refreshCurrentUser();
        }
      } catch (error) {
        const status = (error as { response?: { status?: number } }).response?.status;
        // A disconnected phone retains its account and already-issued capture sessions.
        if (status === 401 || status === 403 || error instanceof SyntaxError) await clearSession();
      } finally {
        setIsBootstrapping(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await client.post<
      ApiEnvelope<
        StaffUser & {
          accessToken: string;
          refreshToken: string;
        }
      >
    >("/staff/staff-login", {
      email,
      password,
    });

    const { accessToken, refreshToken, ...user } = response.data.data;

    await lockQueue();
    queryClient.clear();
    await applySession({
      user,
      accessToken,
      refreshToken,
    });

    if (Platform.OS !== "web") {
      try { await unlockQueue(user); } catch { /* Native build required for encrypted evidence. */ }
    }
    await queryClient.invalidateQueries({ queryKey: ["staff"] });
  };

  const logout = async () => {
    await lockQueue();
    try {
      if (sessionRef.current.accessToken) {
        await client.post("/common/logout");
      }
    } finally {
      await clearSession();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: session.user,
        isBootstrapping,
        login,
        logout,
        refreshCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
