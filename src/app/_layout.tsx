// src/app/_layout.tsx

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Tabs } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootTabs />
    </AuthProvider>
  );
}

function RootTabs() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
        }}
      />

      <Tabs.Screen
        name="ChatScreen"
        options={{
          title: "채팅",
        }}
      />
      <Tabs.Screen
        name="RegisterScreen"
        options={{
          title: "회원가입",
        }}
      />
      <Tabs.Screen
        name="LoginScreen"
        options={{
          title: "로그인",
        }}
      />
      <Tabs.Protected guard={!session}></Tabs.Protected>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
