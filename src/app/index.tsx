// src/app/index.tsx

import { useFocusEffect } from "@react-navigation/native";
import { Link } from "expo-router";
import { useCallback, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const API_BASE_URL = process.env.EXPO_PUBLIC_HONO_SERVER_API;
  const [userList, setUserList] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [erroMsg, setErrorMsg] = useState("");

  useFocusEffect(
    useCallback(() => {
      // 1. 화면에 들어올 때(포커스 될 때) 실행할 작업
      console.log("화면이 포커스 되었습니다! 데이터를 새로고침합니다.");

      // 예: fetchUserData();

      // 2. 화면을 벗어날 때(언포커스 될 때) 실행할 정리 작업
      return () => {
        console.log(
          "화면에서 포커스가 해제되었습니다. 타이머 등을 정리합니다.",
        );
        // 예: 구독 해제, interval 정지 등
      };
    }, []), // 빈 배열을 두어 초기 렌더링 시에만 콜백을 생성하도록 함
  );

  async function getUserList() {
    try {
      setLoading(true);
      setErrorMsg("");
      const response = await fetch(`${API_BASE_URL}/api/user/get_user_list`);
      const result: ApiResultType = await response.json();

      if (!result?.success) {
        setErrorMsg(result?.msg || "유저목록 불러오기 실패");
        return;
      }
      setUserList(result?.data || []);
    } catch (error: any) {
      setErrorMsg(error?.msg || "유저목록 불러오기 실패");
      return;
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>홈 화면</Text>

      <Link href="/ChatScreen" asChild>
        <Button title="탐색 화면으로 이동" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
