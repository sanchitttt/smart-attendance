// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth,initializeAuth } from "firebase/auth";
// Source - https://stackoverflow.com/q/76914913
// Posted by Keunwoo Park, modified by community. See post 'Timeline' for change history
// Retrieved 2026-03-14, License - CC BY-SA 4.0
//@ts-ignore
import { getReactNativePersistence } from "firebase/auth";
import { ReactNativeAsyncStorage } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAos_4g-q0Aap1eKkFk2of71Q6EGMZEEn0",
    authDomain: "smart-attendance-1763d.firebaseapp.com",
    projectId: "smart-attendance-1763d",
    storageBucket: "smart-attendance-1763d.firebasestorage.app",
    messagingSenderId: "518393623953",
    appId: "1:518393623953:web:8ce019cd91d7737778d630",
    measurementId: "G-K506VYX2Q4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = initializeAuth(app,{
    persistence: getReactNativePersistence(AsyncStorage),
});