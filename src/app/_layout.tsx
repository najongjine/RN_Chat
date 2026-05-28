// src/app/_layout.tsx

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { router, Tabs } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootTabs />
    </AuthProvider>
  );
}

function RootTabs() {
  const { session, user, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/LoginScreen");
  }

  const headerRight = () =>
    user ? (
      <View style={styles.headerAuth}>
        <View style={styles.userInfo}>
          <Text style={styles.displayName} numberOfLines={1}>
            {user.display_name}님
          </Text>
          <Text style={styles.username} numberOfLines={1}>
            @{user.username}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed,
          ]}
          onPress={() => void handleSignOut()}
        >
          <Text style={styles.logoutText}>로그아웃</Text>
        </Pressable>
      </View>
    ) : null;

  return (
    <Tabs screenOptions={{ headerRight }}>
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
          href: null,
        }}
      />

      <Tabs.Protected guard={!user?.id}>
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
  headerAuth: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingRight: 14,
    maxWidth: 260,
  },
  userInfo: {
    maxWidth: 140,
    alignItems: "flex-end",
  },
  displayName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
  },
  username: {
    marginTop: 2,
    fontSize: 12,
    color: "#666666",
  },
  logoutButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#111111",
  },
  logoutButtonPressed: {
    opacity: 0.75,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
