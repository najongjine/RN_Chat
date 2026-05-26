import * as SecureStore from "expo-secure-store";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";
import { AuthSessionType } from "@/app/type/types";

const AUTH_SESSION_KEY = "auth_session";

type AuthContextType = {
  session: AuthSessionType | null;
  user: AuthSessionType["user"] | null;
  accessToken: string | null;
  isLoading: boolean;
  signIn: (session: AuthSessionType) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function readSession() {
  if (Platform.OS === "web") {
    return globalThis.localStorage?.getItem(AUTH_SESSION_KEY) ?? null;
  }

  return SecureStore.getItemAsync(AUTH_SESSION_KEY);
}

async function storeSession(session: AuthSessionType) {
  const value = JSON.stringify(session);

  if (Platform.OS === "web") {
    globalThis.localStorage?.setItem(AUTH_SESSION_KEY, value);
    return;
  }

  await SecureStore.setItemAsync(AUTH_SESSION_KEY, value);
}

async function removeSession() {
  if (Platform.OS === "web") {
    globalThis.localStorage?.removeItem(AUTH_SESSION_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
}

function isAuthSession(value: unknown): value is AuthSessionType {
  if (!value || typeof value !== "object") return false;

  const session = value as AuthSessionType;
  return (
    typeof session.access_token === "string" &&
    typeof session.user?.id === "number" &&
    typeof session.user?.username === "string" &&
    typeof session.user?.display_name === "string"
  );
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSessionType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const storedValue = await readSession();
        if (!storedValue) return;

        const savedSession: unknown = JSON.parse(storedValue);
        if (isAuthSession(savedSession)) {
          setSession(savedSession);
        } else {
          await removeSession();
        }
      } catch {
        await removeSession();
      } finally {
        setIsLoading(false);
      }
    }

    void restoreSession();
  }, []);

  async function signIn(newSession: AuthSessionType) {
    await storeSession(newSession);
    setSession(newSession);
  }

  async function signOut() {
    await removeSession();
    setSession(null);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        accessToken: session?.access_token ?? null,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
