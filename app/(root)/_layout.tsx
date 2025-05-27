
import { Stack } from "expo-router";

const Layout = () => {
  return (
          <Stack>
            <Stack.Screen name="(admin)" options={{ headerShown: false }} />
            <Stack.Screen name="(user)" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
            <Stack.Screen name="edit_email" options={{ headerShown: false }} />
            <Stack.Screen name="edit_password" options={{ headerShown: false }} />
            <Stack.Screen name="select_ui" options={{ headerShown: false }} />
            <Stack.Screen name="list-data" options={{ headerShown: false }} />
          </Stack>
  );
};
export default Layout;