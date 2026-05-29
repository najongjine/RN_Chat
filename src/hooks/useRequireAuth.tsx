import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type RequireAuthOptions = {
  title?: string;
  message?: string;
};

type RequireAuthContextType = {
  requireAuth: (
    onAuthenticated: () => void,
    options?: RequireAuthOptions,
  ) => void;
};

const RequireAuthContext = createContext<RequireAuthContextType | undefined>(
  undefined,
);

export function RequireAuthProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState<RequireAuthOptions | null>(null);

  function requireAuth(
    onAuthenticated: () => void,
    options: RequireAuthOptions = {},
  ) {
    if (user?.id) {
      onAuthenticated();
      return;
    }

    setPrompt({
      title: options.title || "로그인이 필요합니다",
      message: options.message || "이 기능을 사용하려면 먼저 로그인해주세요.",
    });
  }

  function closePrompt() {
    setPrompt(null);
  }

  function goToLogin() {
    closePrompt();
    router.push("/LoginScreen");
  }

  return (
    <RequireAuthContext.Provider value={{ requireAuth }}>
      {children}
      <Modal
        visible={!!prompt}
        transparent
        animationType="fade"
        onRequestClose={closePrompt}
      >
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <Text style={styles.title}>{prompt?.title}</Text>
            <Text style={styles.message}>{prompt?.message}</Text>
            <View style={styles.actions}>
              <Pressable style={styles.cancelButton} onPress={closePrompt}>
                <Text style={styles.cancelText}>취소</Text>
              </Pressable>
              <Pressable style={styles.loginButton} onPress={goToLogin}>
                <Text style={styles.loginText}>로그인</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </RequireAuthContext.Provider>
  );
}

export function useRequireAuth() {
  const context = useContext(RequireAuthContext);

  if (!context) {
    throw new Error("useRequireAuth must be used inside RequireAuthProvider.");
  }

  return context;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  dialog: {
    width: "100%",
    maxWidth: 360,
    padding: 20,
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
  },
  message: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#444444",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 6,
    backgroundColor: "#eeeeee",
  },
  loginButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 6,
    backgroundColor: "#111111",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222222",
  },
  loginText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
