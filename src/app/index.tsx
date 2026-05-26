// https://chatgpt.com/share/6a14e956-62c4-83ab-966b-536b4d8d6ac3

import { useFocusEffect } from "@react-navigation/native";
import { Link } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ApiResultType, UserType } from "./type/types";

export default function HomeScreen() {
  const API_BASE_URL = process.env.EXPO_PUBLIC_HONO_SERVER_API;
  const [userList, setUserList] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
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
  async function init() {
    await getUserList();
  }

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
      <Text style={styles.title}>유저 목록</Text>

      {loading && <ActivityIndicator size="large" />}

      {erroMsg !== "" && <Text style={styles.errorText}>{erroMsg}</Text>}

      {!loading && userList.length === 0 && erroMsg === "" && (
        <Text style={styles.emptyText}>등록된 유저가 없습니다.</Text>
      )}

      <FlatList
        data={userList}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.displayName}>{item.display_name}</Text>
            <Text style={styles.createdAt}>가입일: {item.created_at}</Text>
          </View>
        )}
      />

      <Link href="/ChatScreen" asChild>
        <Button title="탐색 화면으로 이동" />
      </Link>
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
  list: {
    flex: 1,
    width: "100%",
  },
  listContent: {
    gap: 12,
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,

    // iOS 그림자
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,

    // Android 그림자
    elevation: 3,
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },
  displayName: {
    fontSize: 16,
    color: "#555",
    marginBottom: 6,
  },
  createdAt: {
    fontSize: 13,
    color: "#999",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#777",
    marginBottom: 12,
  },
});
