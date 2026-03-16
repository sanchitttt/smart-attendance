"use strict";
exports.__esModule = true;
exports.auth = void 0;
// Import the functions you need from the SDKs you need
var app_1 = require("firebase/app");
var auth_1 = require("firebase/auth");
// Source - https://stackoverflow.com/q/76914913
// Posted by Keunwoo Park, modified by community. See post 'Timeline' for change history
// Retrieved 2026-03-14, License - CC BY-SA 4.0
//@ts-ignore
var auth_2 = require("firebase/auth");
var async_storage_1 = require("@react-native-async-storage/async-storage");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyAos_4g-q0Aap1eKkFk2of71Q6EGMZEEn0",
    authDomain: "smart-attendance-1763d.firebaseapp.com",
    projectId: "smart-attendance-1763d",
    storageBucket: "smart-attendance-1763d.firebasestorage.app",
    messagingSenderId: "518393623953",
    appId: "1:518393623953:web:8ce019cd91d7737778d630",
    measurementId: "G-K506VYX2Q4"
};
// Initialize Firebase
var app = app_1.initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
exports.auth = auth_1.initializeAuth(app, {
    persistence: auth_2.getReactNativePersistence(async_storage_1["default"])
});
