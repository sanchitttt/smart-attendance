import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const router = useRouter();

  const username = "Sanchit";
  const rollNumber = "2210345";

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* NAVBAR */}
      <View style={styles.navbar}>
        <View>
          <Text style={styles.welcome}>Welcome, {username}</Text>
          <Text style={styles.roll}>Roll No: {rollNumber}</Text>
        </View>

        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* MARK ATTENDANCE BUTTON */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => router.push("/scan")}
      >
        <MaterialIcons name="qr-code-scanner" size={28} color="white" />
        <Text style={styles.scanText}>Mark Attendance</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  navbar: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
  },

  welcome: {
    fontSize: 20,
    fontWeight: "600",
  },

  roll: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },

  logout: {
    fontSize: 16,
    color: "#e53935",
    fontWeight: "600",
  },

  scanButton: {
    marginTop: 40,
    marginHorizontal: 20,
    backgroundColor: "#1976D2",
    padding: 18,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  scanText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});