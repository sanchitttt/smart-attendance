import React from "react";
import { Stack } from "expo-router";
import { GoogleSignin } from "@react-native-google-signin/google-signin";


GoogleSignin.configure({
  webClientId: "518393623953-qq9nu11qtgrspmtbnler7aah2jf6j9h8.apps.googleusercontent.com",
});


export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Smart Attendance",
          headerShown: false
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
          headerTitle: 'Scan QR',
          headerShown: false
        }}
      />
      <Stack.Screen
        name="login"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}