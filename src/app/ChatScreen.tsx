// src/app/explore.tsx

import { TarotCardPickerModal } from "@/components/TarotCardPickerModal";
import { tarotCards } from "@/constants/tarotCards";
import { useAuth } from "@/context/AuthContext";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { io, Socket } from "socket.io-client";
import { ChatMessageType, TarotCardType } from "./type/types";

export default function ChatScreen() {
  const HONO_SERVER_API = process.env.EXPO_PUBLIC_HONO_SERVER_API;
  const params = useLocalSearchParams();
  const otherId = Number(params?.otherId || 0);
  const otherName = String(params?.otherName || "");
  const { user, accessToken, validateSession, signOut } = useAuth();
  const [roomId, setRoomId] = useState("");

  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [text, setText] = useState("");
  const [message, setMessage] = useState<ChatMessageType[]>([]);

  const [tarotModalVisible, setTarotModalVisible] = useState(false);
  const [selectedTarotCard, setSelectedTarotCard] =
    useState<TarotCardType | null>(null);

  // 화면 진입하면 무조건 실행
  useEffect(() => {
    let newSocket: Socket | null = null;
    let cancelled = false;

    async function connectAfterAuthCheck() {
      if (!HONO_SERVER_API || !accessToken || !user?.id) {
        await signOut();
        router.replace("/LoginScreen");
        return;
      }

      const valid = await validateSession();
      if (cancelled) return;

      if (!valid) {
        router.replace("/LoginScreen");
        return;
      }
      // 소켓을 직접 조작하기 위해서 socket 객체를 만듬
      /* 쉽게 생각하면 const newSocket = io(HONO_SERVER_API...
    이 코드가 socket 서버 접속 해주는놈  */
      newSocket = io(HONO_SERVER_API, {
        transports: ["websocket"],
      });
      const activeSocket = newSocket;

      setSocket(activeSocket); // 화면에 보일때 쓰려고 state변수에 또 따로 저장

      // connect라는 메세지 받으면 어떻게 할거야?
      newSocket.on("connect", () => {
        // f12 콘솔에 연결성공이라는 글자 띄울거야
        console.log(`서버 연결 성공`, newSocket?.id);
        setConnected(true); // 화면에 보일때 쓰려고 state변수에 또 따로 저장

        // emit: 메세지 발사
        activeSocket.emit("join_room", {
          receiverId: otherId,
          userId: user?.id || 0,
          roomType: "direct",
        });
      });
      newSocket.on("disconnect", () => {
        console.log(`서버 연결 끊김`);
        setConnected(false);
      });
      newSocket.on("joined_room", (data) => {
        console.log("방 입장 완료", data);

        if (!data?.success) {
          console.log("방 입장 실패:", data?.msg || "");
          return;
        }

        // 서버가 준 진짜 roomId 저장
        setRoomId(data?.roomId || "");

        // 그 roomId로 이전 메시지 조회
        activeSocket.emit("get_messages", {
          roomId: data.roomId,
        });
      });
      newSocket.on("message_list", (messageList: ChatMessageType[]) => {
        setMessage(messageList);
      });
      newSocket.on("receive_message", (message: ChatMessageType) => {
        setMessage((prev) => [...prev, message]);
      });
    }

    void connectAfterAuthCheck();

    return () => {
      cancelled = true;
      newSocket?.disconnect();
    };
  }, [
    HONO_SERVER_API,
    accessToken,
    user?.id,
    otherId,
    signOut,
    validateSession,
  ]);

  const sendMessage = () => {
    if (!socket) return;
    if (!roomId) return;
    if (!text.trim() && !selectedTarotCard) return;

    socket.emit("send_message", {
      roomId,
      senderId: Number(user?.id || 0),
      receiverId: Number(otherId),
      text: text.trim(),
      tarotCardId: selectedTarotCard?.id || null,
    });
    setText("");
    setSelectedTarotCard(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text>{HONO_SERVER_API}</Text>
          <Text style={styles.title}>
            userId:{user?.id || 0}, otherid:{otherId}, othername:{otherName}
          </Text>
          <Text>roomId:{roomId}</Text>
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
            const isMine = item.senderId == String(user?.id || 0);
            const tarotCard = item.tarotCardId
              ? tarotCards.find((card) => card.id === item.tarotCardId)
              : null;

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
                  {tarotCard && (
                    <View style={styles.tarotMessageArea}>
                      <Image
                        source={tarotCard.image}
                        style={styles.tarotMessageImage}
                      />
                      <Text style={styles.tarotMessageName}>
                        {tarotCard.name}
                      </Text>
                    </View>
                  )}
                  {!!item.text && (
                    <Text style={styles.messageText}>{item.text}</Text>
                  )}
                </View>
              </View>
            );
          }}
        />

        <View>
          <Button title="타로" onPress={() => setTarotModalVisible(true)} />
        </View>

        {selectedTarotCard && (
          <View style={styles.selectedTarotArea}>
            <Image
              source={selectedTarotCard.image}
              style={styles.selectedTarotImage}
            />
            <View style={styles.selectedTarotTextArea}>
              <Text style={styles.selectedTarotLabel}>선택한 타로 카드</Text>
              <Text style={styles.selectedTarotName}>
                {selectedTarotCard.name}
              </Text>
            </View>
            <Button title="취소" onPress={() => setSelectedTarotCard(null)} />
          </View>
        )}

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="메시지 입력"
          />
          <Button title="전송" onPress={sendMessage} />
        </View>
        <TarotCardPickerModal
          visible={tarotModalVisible}
          cards={tarotCards}
          selectedCard={selectedTarotCard}
          onClose={() => {
            setTarotModalVisible(false);
          }}
          onSelectCard={(card) => {
            setSelectedTarotCard(card);
            setTarotModalVisible(false);
          }}
        />
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
  tarotMessageArea: {
    marginBottom: 6,
  },
  tarotMessageImage: {
    width: 120,
    height: 180,
    borderRadius: 6,
    resizeMode: "contain",
    backgroundColor: "#eeeeee",
  },
  tarotMessageName: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#222222",
  },
  selectedTarotArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
    backgroundColor: "#f8f8f8",
  },
  selectedTarotImage: {
    width: 42,
    height: 62,
    borderRadius: 4,
    resizeMode: "contain",
    backgroundColor: "#eeeeee",
  },
  selectedTarotTextArea: {
    flex: 1,
  },
  selectedTarotLabel: {
    fontSize: 12,
    color: "#666666",
  },
  selectedTarotName: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: "700",
    color: "#222222",
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
