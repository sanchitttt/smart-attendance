import { TouchableOpacity,Text,StyleSheet } from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider,signInWithCredential } from "firebase/auth";
import { auth } from "@/services/firebase";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function GoogleSignInButton() {
    const [loading,setLoading] = useState(false);
    const router = useRouter();
    const handleSignIn = async () => {
        if (loading) return;

        try {
            setLoading(true);

            await GoogleSignin.hasPlayServices();

            const userInfo = await GoogleSignin.signIn();

            const credential = GoogleAuthProvider.credential(
                userInfo.data?.idToken
            );

            await signInWithCredential(auth,credential);

            router.replace("/home");
        } catch (error) {
            console.log("Error aya",error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
            <Text style={styles.text}>Continue with Google</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#fff",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    text: {
        fontSize: 16,
        fontWeight: "600",
    },
});