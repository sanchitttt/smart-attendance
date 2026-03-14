// app/actions/logout.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  // Clear auth cookie
  await cookies().delete("access_token");

  // Redirect after logout
  redirect("/login");
}