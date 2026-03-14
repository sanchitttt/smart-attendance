import { Stack } from "expo-router";
import { Pressable,Text } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useRouter } from "expo-router";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId: "YOUR_WEB_CLIENT_ID_FROM_FIREBASE",
  offlineAccess: true,
});

function LogoutButton() {
  const router = useRouter();

  return (
    <Pressable
      onPress={async () => {
        await signOut(auth);
        router.replace("/login");
      }}
      style={{ marginRight: 15 }}
    >
      <Text>Logout</Text>
    </Pressable>
  );
}

function ScanButton() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/scan")}
      style={{ marginRight: 15 }}
    >
      <Text>Scan QR</Text>
    </Pressable>
  );
}

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Smart Attendance",
          headerRight: () => (
            <>
              <ScanButton />
              <LogoutButton />
            </>
          ),
        }}
      />
      <Stack.Screen
        name="home"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="scan"
        options={{
          headerTitle: 'Scan QR ',
          headerShown: false
        }}
      />

      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}