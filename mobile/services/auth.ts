import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

export const logout = async () => {
    await signOut(auth);
}