'use server'
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function requireTeacherAuth() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
        redirect("/teacher-login");
    }

    return accessToken;
}



export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('access_token')
}

