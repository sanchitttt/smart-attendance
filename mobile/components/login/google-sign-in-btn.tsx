import { auth } from "@/services/firebase";
import { getDeviceInfo } from "@/utils/device";
import { saveToken, saveUserProfile } from "@/utils/secureStore";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { GoogleAuthProvider,signInWithCredential } from "firebase/auth";
import React,{ useState } from "react";
import { StyleSheet,Text,TouchableOpacity,View } from "react-native";
import { SvgXml } from "react-native-svg";

// Official Google "G" logo SVG (you can also use an image asset)
const googleLogoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.51h5.84c-.25 1.31-.98 2.42-2.07 3.16v2.63h3.35c1.96-1.81 3.1-4.47 3.1-7.8z"/>
  <path fill="#34A853" d="M12 23c2.97 0 5.46-1.01 7.28-2.73l-3.35-2.63c-1.01.68-2.29 1.08-3.93 1.08-3.02 0-5.58-2.04-6.49-4.79H.96v2.67C2.75 20.84 6.93 23 12 23z"/>
  <path fill="#FBBC05" d="M5.51 14.21c-.23-.68-.36-1.41-.36-2.21s.13-1.53.36-2.21V7.34H.96C.35 8.85 0 10.39 0 12s.35 3.15.96 4.66l4.55-2.45z"/>
  <path fill="#EA4335" d="M12 4.98c1.64 0 3.11.56 4.27 1.66l3.19-3.19C17.46 1.01 14.97 0 12 0 6.93 0 2.75 2.16.96 5.34l4.55 2.45C6.42 5.02 8.98 4.98 12 4.98z"/>
</svg>
`;

export default function GoogleSignInButton() {
    const [loading,setLoading] = useState(false);
    const router = useRouter();
    const handleSignIn = async () => {
        if (loading) return;

        try {
            setLoading(true);

            await GoogleSignin.hasPlayServices();

            const userInfo = await GoogleSignin.signIn();

            // 🔹 Google token
            const googleIdToken = userInfo.data?.idToken;

            if (!googleIdToken) {
                throw new Error("Google ID token missing");
            }

            // 🔹 Login to Firebase using Google token
            const credential = GoogleAuthProvider.credential(googleIdToken);

            await signInWithCredential(auth,credential);

            // 🔹 Now get Firebase token
            const firebaseToken = await auth.currentUser?.getIdToken();

            const { deviceFingerprint,deviceMetadata } = getDeviceInfo();

            const payload = {
                idToken: firebaseToken,
                deviceFingerprint,
                deviceMetadata,
            };

            console.log(payload);

            const response = await fetch("https://muscles-burlington-trace-apart.trycloudflare.com/api/v1/users/login",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            console.log(response);
            console.log(data);

            if (!response.ok) {
                throw new Error(data.message);
            }

            // Persist auth token + profile
            await saveToken(data.token);
            await saveUserProfile({
                token: data.token,
                role: data.role,
                name: data.name,
                email: data.email,
                rollNo: data.rollNo,
                batchStartYear: data.batchStartYear,
                program: data.program,
                profilePictureUrl: data.profilePictureUrl,
            });

            router.replace("/home");

        } catch (error) {
            console.log("Error aya",error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableOpacity
            style={styles.googleButton}
            activeOpacity={0.85}
            onPress={handleSignIn}
        >
            <View style={styles.googleIconContainer}>
                <SvgXml xml={googleLogoSvg} width={24} height={24} />
            </View>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
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
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        width: '100%',
        maxWidth: 340,
        shadowColor: '#000',
        shadowOffset: { width: 0,height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    googleIconContainer: {
        marginRight: 16,
    },
    googleButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1f2937',
        textAlign: 'center'
    },
});