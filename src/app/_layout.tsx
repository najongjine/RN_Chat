// src/app/_layout.tsx

import { Tabs } from "expo-router";

export default function RootLayout() {
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
    </Tabs>
  );
}
