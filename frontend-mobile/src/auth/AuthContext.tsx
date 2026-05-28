import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { client, configureApiAuth } from "../api/client";
import { STORAGE_KEY } from "../config";
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
    return;
  }

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
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
      getTokens: async () => ({
        accessToken: sessionRef.current.accessToken,
        refreshToken: sessionRef.current.refreshToken,
      }),
      setTokens: updateTokens,
      clearSession,
    });

    void (async () => {
      try {
        const storedSession = await AsyncStorage.getItem(STORAGE_KEY);

        if (!storedSession) {
          setIsBootstrapping(false);
          return;
        }

        const parsed = JSON.parse(storedSession) as AuthSession;
        sessionRef.current = parsed;
        setSession(parsed);

        if (parsed.accessToken) {
          await refreshCurrentUser();
        }
      } catch {
        await clearSession();
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

    await applySession({
      user,
      accessToken,
      refreshToken,
    });

    await queryClient.invalidateQueries({ queryKey: ["staff"] });
  };

  const logout = async () => {
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
