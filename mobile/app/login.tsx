import { View,Text,StyleSheet } from "react-native";
import GoogleSignInButton from "@/components/login/google-sign-in-btn";
import useAuth from "@/hooks/use-auth";
import { Redirect,useRouter } from "expo-router";

export default function LoginScreen() {
    const auth = useAuth();
    const router = useRouter();

    if (auth.user) {
        return <Redirect href='/home' />
    }
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Smart Attendance</Text>
            <GoogleSignInButton />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 40,
    },
});