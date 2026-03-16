'use server'
import { signOut } from "firebase/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./firebase";
import toast from "react-hot-toast";

export async function requireTeacherAuth() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    return accessToken;
}


export async function logout() {
    'use server';
    const cookieStore = await cookies();
    cookieStore.delete('access_token');   
    redirect("/auth/login");

}

