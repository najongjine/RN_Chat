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
        name="explore"
        options={{
          title: "탐색",
        }}
      />
    </Tabs>
  );
}
