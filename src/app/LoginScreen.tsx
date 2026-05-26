// https://chatgpt.com/share/6a14e956-62c4-83ab-966b-536b4d8d6ac3

import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const API_BASE_URL = process.env.EXPO_PUBLIC_HONO_SERVER_API;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erroMsg, setErrorMsg] = useState("");

  useFocusEffect(
    useCallback(() => {
      // 1. 화면에 들어올 때(포커스 될 때) 실행할 작업
      console.log("화면이 포커스 되었습니다! 데이터를 새로고침합니다.");
      init();
      return () => {
        console.log(
          "화면에서 포커스가 해제되었습니다. 타이머 등을 정리합니다.",
        );
        // 예: 구독 해제, interval 정지 등
      };
    }, []), // 빈 배열을 두어 초기 렌더링 시에만 콜백을 생성하도록 함
  );
  async function init() {}

  async function login() {
    try {
    } catch (error: any) {
      setErrorMsg(error?.msg || "로그인 실패");
      return;
    } finally {
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>
      <View>
        <TextInput />
      </View>
      <View>
        <TextInput />
      </View>
      <View>
        <Button title="로그인" />
      </View>
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
    marginBottom: 20,
    textAlign: "center",
  },
});
