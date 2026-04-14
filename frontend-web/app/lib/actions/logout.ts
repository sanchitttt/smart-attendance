// app/actions/logout.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  // Clear auth cookie
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete('session');
  cookieStore.delete('__session');

  // Redirect after logout
  redirect("/login");
}