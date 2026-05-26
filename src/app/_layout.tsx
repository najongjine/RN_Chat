// src/app/_layout.tsx

import { Tabs } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AuthProvider, useAuth } from "@/context/AuthContext";

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
      <Tabs.Protected guard={!!session}>
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
      </Tabs.Protected>

      <Tabs.Protected guard={!session}>
        <Tabs.Screen
          name="LoginScreen"
          options={{
            title: "로그인",
            tabBarStyle: { display: "none" },
          }}
        />
      </Tabs.Protected>
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
