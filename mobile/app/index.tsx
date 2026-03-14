import { Redirect } from "expo-router";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import useAuth from "@/hooks/use-auth";

GoogleSignin.configure({
    webClientId: "518393623953-qq9nu11qtgrspmtbnler7aah2jf6j9h8.apps.googleusercontent.com",
});
export default function Index() {
    const { user,loading } = useAuth();

    if (loading) return null;

    if (!user) {
        return <Redirect href="/login" />;
    }

    return <Redirect href="/home" />;
}