import { Stack } from 'expo-router';

export default function TimbangLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false, // Hide header for the main timbang screen
        }}
      />
      <Stack.Screen
        name="status-gizi"
        options={{
          headerShown: false, // We'll use a custom back button in the screen itself
          // You can also use a custom header if preferred:
          // headerTitle: "Status Gizi",
          // headerBackTitle: "Kembali",
        }}
      />
    </Stack>
  );
}