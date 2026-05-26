import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ApiResultType, AuthSessionType } from "./type/types";

export default function RegisterScreen() {
  const API_BASE_URL = process.env.EXPO_PUBLIC_HONO_SERVER_API;
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [display_name, setDisplay_name] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    if (!username.trim() || !password) {
      setErrorMsg("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const response = await fetch(`${API_BASE_URL}/api/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
          display_name,
        }),
      });
      const result: ApiResultType<AuthSessionType> = await response.json();

      if (!result.success || !result.data) {
        setErrorMsg(result.msg || "회원가입 실패");
        return;
      }

      await signIn(result.data);
      router.replace("/");
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : "회원가입 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입</Text>

      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="아이디"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        value={display_name}
        onChangeText={setDisplay_name}
        placeholder="아이디"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="비밀번호"
        secureTextEntry
        onSubmitEditing={() => void login()}
      />

      {errorMsg !== "" && <Text style={styles.errorText}>{errorMsg}</Text>}
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="회원가입" onPress={() => void login()} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 12,
  },
});
