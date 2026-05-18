// src/app/_layout.tsx

import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "홈",
        }}
      />

      <Stack.Screen
        name="explore"
        options={{
          title: "탐색",
        }}
      />
    </Stack>
  );
}
