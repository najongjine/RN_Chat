// src/app/explore.tsx

import { useAuth } from "@/context/AuthContext";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { io, Socket } from "socket.io-client";

type ChatMessageType = {
  id: number;
  roomId: string;
  senderId: string;
  recieverId: string;
  text: string;
  createdDt: string;
};

export default function ChatScreen() {
  const HONO_SERVER_API = process.env.EXPO_PUBLIC_HONO_SERVER_API;
  const params = useLocalSearchParams();
  const { user, accessToken } = useAuth();
  const MY_USER_ID = String(user?.id);
  const OTHER_USER_ID = String(params.otherId || "user2");
  const ROOM_ID = [MY_USER_ID, OTHER_USER_ID].sort().join("_");

  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [text, setText] = useState("");
  const [message, setMessage] = useState<ChatMessageType[]>([]);

  // 화면 진입하면 무조건 실행
  useEffect(() => {
    // 소켓을 직접 조작하기 위해서 socket 객체를 만듬
    /* 쉽게 생각하면 const newSocket = io(HONO_SERVER_API...
    이 코드가 socket 서버 접속 해주는놈  */
    const newSocket = io(HONO_SERVER_API, {
      transports: ["websocket"],
    });

    setSocket(newSocket); // 화면에 보일때 쓰려고 state변수에 또 따로 저장

    // connect라는 메세지 받으면 어떻게 할거야?
    newSocket.on("connect", () => {
      // f12 콘솔에 연결성공이라는 글자 띄울거야
      console.log(`서버 연결 성공`, newSocket?.id);
      setConnected(true); // 화면에 보일때 쓰려고 state변수에 또 따로 저장

      // emit: 메세지 발사
      newSocket.emit("join_room", {
        roomId: ROOM_ID,
        userId: MY_USER_ID,
      });
      newSocket.emit("get_messages", {
        roomId: ROOM_ID,
      });
    });
    newSocket.on("disconnect", () => {
      console.log(`서버 연결 끊김`);
      setConnected(false);
    });
    newSocket.on("joined_room", (data) => {
      console.log(`방 입장 완료`, data);
    });
    newSocket.on("message_list", (messageList: ChatMessageType[]) => {
      setMessage(messageList);
    });
    newSocket.on("receive_message", (message: ChatMessageType) => {
      setMessage((prev) => [...prev, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (!socket) return;
    if (!text?.trim()) return;
    socket.emit("send_message", {
      roomId: ROOM_ID,
      senderId: MY_USER_ID,
      receiverId: OTHER_USER_ID,
      text: text?.trim() || "",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text>{HONO_SERVER_API}</Text>
          <Text style={styles.title}>1:1 채팅</Text>
          <Text>{user?.display_name}님으로 접속 중</Text>
          <Text style={connected ? styles.connected : styles.disconnected}>
            {connected ? "서버 연결됨" : "서버 연결 안 됨"}
          </Text>
        </View>

        <FlatList
          style={styles.messageList}
          data={message}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const isMine = item.senderId === MY_USER_ID;

            return (
              <View
                style={[
                  styles.messageRow,
                  isMine ? styles.myMessageRow : styles.otherMessageRow,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isMine ? styles.myBubble : styles.otherBubble,
                  ]}
                >
                  <Text style={styles.senderText}>
                    {isMine ? "나" : item.senderId}
                  </Text>
                  <Text style={styles.messageText}>{item.text}</Text>
                </View>
              </View>
            );
          }}
        />

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="메시지 입력"
          />
          <Button title="전송" onPress={sendMessage} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardArea: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  connected: {
    marginTop: 4,
    color: "green",
  },
  disconnected: {
    marginTop: 4,
    color: "red",
  },
  messageList: {
    flex: 1,
    padding: 12,
  },
  messageRow: {
    marginVertical: 4,
  },
  myMessageRow: {
    alignItems: "flex-end",
  },
  otherMessageRow: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 10,
  },
  myBubble: {
    backgroundColor: "#d2f8d2",
  },
  otherBubble: {
    backgroundColor: "#eeeeee",
  },
  senderText: {
    fontSize: 12,
    color: "#555555",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
  },
  inputArea: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
});
