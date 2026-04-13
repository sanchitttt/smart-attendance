import type { Metadata } from "next";
import ClassesUI from '@/app/components/ClassesUI';
import { redirect } from 'next/navigation';
import API_ROUTES from '@/app/config/api.routes';
import Logout from '@/app/components/ui/logout';
import { Card,CardContent } from '@/app/components/ui/card';
import { Calendar } from 'lucide-react';
import { apiFetch } from "@/app/lib/apiFetch";
import { signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase";

export const metadata: Metadata = {
    title: "My Classes",
    description:
        "View today’s schedule, review class details, and start a QR-based attendance session.",
};

export default async function ClassesPage() {
    const res = await apiFetch(API_ROUTES.MY_CLASSES,{
        method: "GET",
        cache: 'no-store',
    });
    console.log(res);

    if (!res.ok) {
        if (res.status == 401 || res.status == 403) {
            await signOut(auth);
            await fetch(API_ROUTES.LOGOUT,{
                method: "POST",
                credentials: "include",
            });
            redirect("/auth/login")
        }
    }

    console.log('Backend response status:',res.status);
    console.log('Backend response ok:',res.ok);

    const data = await res.json();
    const summaryRes = await apiFetch(API_ROUTES.TIMETABLE_SUMMARY,{
        method: "GET",
        cache: "no-store",
    });

    if (!summaryRes.ok) {
        if (summaryRes.status == 401 || summaryRes.status == 403) {
            await signOut(auth);
            await fetch(API_ROUTES.LOGOUT,{
                method: "POST",
                credentials: "include",
            });
            redirect("/auth/login")
        }
    }

    const summaryJson = summaryRes.ok ? await summaryRes.json() : null;
    const summaryData = summaryJson?.data ?? null;

    const classes = data?.data?.classes ?? [];
    const today = new Date();

    return (
        <div className="min-h-screen w-full relative text-gray-900">
            {/* Clean subtle background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
            <div
                className="absolute inset-0 opacity-[0.35]"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, rgba(15, 23, 42, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.06) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                    maskImage: "radial-gradient(circle at 50% 0%, black 35%, transparent 75%)",
                    WebkitMaskImage: "radial-gradient(circle at 50% 0%, black 35%, transparent 75%)",
                }}
            />

            <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
                            My Classes
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600">
                            {classes.length ? (
                                <>
                                    Welcome back,{" "}
                                    <span className="font-medium text-gray-800">
                                        {classes[0].teacherName}
                                    </span>
                                </>
                            ) : (
                                "Your timetable will appear here."
                            )}
                        </p>
                    </div>

                    <div className="flex items-center justify-start sm:justify-end">
                        <Logout />
                    </div>
                </div>

                {/* Date */}
                <Card className="border border-slate-200/70 shadow-sm bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                    <CardContent className="p-5 sm:p-6 flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-indigo-600/10 text-indigo-700 flex items-center justify-center ring-1 ring-indigo-600/10">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-gray-500">
                                Today
                            </p>
                            <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                {today.toLocaleDateString("en-IN",{
                                    weekday: "long",
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <ClassesUI classes={classes} summaryData={summaryData} />
            </div>
        </div>
    );
}