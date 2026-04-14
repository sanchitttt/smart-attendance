import React from 'react'
import type { Metadata } from "next";
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card,CardContent,CardDescription,CardHeader,CardTitle } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import API_ROUTES from '@/app/config/api.routes';
import { notFound,redirect } from 'next/navigation';
import { AlertCircle,ArrowLeft,BookOpen,CheckCircle2,Clock,Home,LogOut,QrCode,RefreshCw,Users } from 'lucide-react';
import { AnimatePresence,motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import GenerateQR from '@/app/components/GenerateQR';
import BackButton from '@/app/components/ui/back-button';
import Logout from '@/app/components/ui/logout';
import LiveAttendance from '../../../components/attendance/LiveAttendance';
import SessionClosed from '../../../components/attendance/SessionClosed';
import AttendanceWrapper from '../../../components/attendance/AttendanceWrapper';
import { apiFetch } from "@/app/lib/apiFetch";

interface Cls {
    timetableID: number;
    subjectName: string;
    programName: string;
    semester: number;
    adminName: string;
    status: "old" | "active" | "upcoming";
    startTime: string; // HH:mm:ss
    endTime: string;   // HH:mm:ss
    startYear: string;
    endYear: string;
}

export const metadata: Metadata = {
    title: "Attendance",
    description:
        "Generate a QR code and track live attendance for this class session.",
};



type PageProps = {
    params: { timetableID: string };
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

async function TakeAttendance({ params,searchParams }: PageProps) {
    const { timetableID } = await params;
    const query = await searchParams;
    const sessionId = query.sessionId;

    if (!sessionId) {
        return notFound();
    }

    const students = [];
    const isActive = false;
    const res = await apiFetch(API_ROUTES.CLASS_SESSION_DETAILS(timetableID,sessionId as string),{
        credentials: "include",
    });

    console.log(res);

    if (!res) {
        // Handle fetch failure gracefully
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <Card className="max-w-lg text-center p-10">
                    <CardContent className="space-y-6">
                        <AlertCircle className="h-16 w-16 mx-auto text-red-500" />
                        <h2 className="text-2xl font-bold">Connection Error</h2>
                        <p className="text-gray-600">
                            Could not reach the server. Please check your network or try again later.
                        </p>
                        <Button onClick={() => window.location.reload()}>Retry</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (res.status == 403) {
        redirect('/auth/login');
    }
    else if (res.status == 400) {
        const data = await res.json();
        return data?.data?.message;
    }

    const data = await res.json();
    const cls: Cls = data?.data;
    // const today = new Date();

    function formatTimeRange(
        startTime: string,
        endTime: string
    ): string {
        const format = (time: string) => {
            const [h,m] = time.split(":");
            return `${h.padStart(2,"0")}:${m.padStart(2,"0")}`;
        };

        return `${format(startTime)} - ${format(endTime)}`;
    };

    console.log(data?.data);
    if (data?.data?.sessionStatus === 'CLOSED' || data?.data?.sessionStatus === 'CANCELLED') {
        return <SessionClosed />
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden text-gray-900">
            {/* <div className="min-h-screen w-full bg-white relative text-gray-800"> */}
                {/* Crosshatch Art - Light Pattern */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                        backgroundImage: `
        repeating-linear-gradient(22.5deg, transparent, transparent 2px, rgba(75, 85, 99, 0.06) 2px, rgba(75, 85, 99, 0.06) 3px, transparent 3px, transparent 8px),
        repeating-linear-gradient(67.5deg, transparent, transparent 2px, rgba(107, 114, 128, 0.05) 2px, rgba(107, 114, 128, 0.05) 3px, transparent 3px, transparent 8px),
        repeating-linear-gradient(112.5deg, transparent, transparent 2px, rgba(55, 65, 81, 0.04) 2px, rgba(55, 65, 81, 0.04) 3px, transparent 3px, transparent 8px),
        repeating-linear-gradient(157.5deg, transparent, transparent 2px, rgba(31, 41, 55, 0.03) 2px, rgba(31, 41, 55, 0.03) 3px, transparent 3px, transparent 8px)
      `,
                    }}
                />
                {/* Your Content/Components */}
            {/* </div> */}

            {/* Page Content */}
            <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                        <BackButton />
                        <div className="space-y-1">
                            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
                                Attendance
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600">
                                Welcome back, <span className="font-medium text-gray-800">{cls.adminName}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-start sm:justify-end">
                        <Logout />
                    </div>
                </div>

                {/* Class Information Card */}
                <Card className="border border-slate-200/70 shadow-sm bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                    <CardContent className="p-5 sm:p-6">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white/60 px-3 py-3">
                                <div className="h-10 w-10 rounded-xl bg-indigo-600/10 text-indigo-700 flex items-center justify-center ring-1 ring-indigo-600/10 flex-shrink-0">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] leading-4 text-gray-500">Subject</p>
                                    <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{cls.subjectName}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white/60 px-3 py-3">
                                <div className="h-10 w-10 rounded-xl bg-slate-900/5 text-slate-700 flex items-center justify-center ring-1 ring-slate-900/10 flex-shrink-0">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] leading-4 text-gray-500">Program</p>
                                    <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{cls.programName}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white/60 px-3 py-3">
                                <div className="h-10 w-10 rounded-xl bg-slate-900/5 text-slate-700 flex items-center justify-center ring-1 ring-slate-900/10 flex-shrink-0">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] leading-4 text-gray-500">Time</p>
                                    <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                        {formatTimeRange(cls.startTime,cls.endTime)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white/60 px-3 py-3">
                                <div className="h-10 w-10 rounded-xl bg-slate-900/5 text-slate-700 flex items-center justify-center ring-1 ring-slate-900/10 flex-shrink-0">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] leading-4 text-gray-500">Batch</p>
                                    <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                        {`${cls.startYear}-${cls.endYear}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white/60 px-3 py-3">
                                <div className="h-10 w-10 rounded-xl bg-slate-900/5 text-slate-700 flex items-center justify-center ring-1 ring-slate-900/10 flex-shrink-0">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] leading-4 text-gray-500">Semester</p>
                                    <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{cls.semester}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* <div className="grid lg:grid-cols-5 gap-6"> */}

                {/* QR Section */}
                <AttendanceWrapper
                    sessionId={sessionId as string}
                    timetableID={timetableID}
                />

                {/* </div> */}

                {/* Session Summary */}
                {students.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Session Summary</CardTitle>
                        </CardHeader>

                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Total Students</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {students.length}
                                    </p>
                                </div>

                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Status</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {isActive ? 'Active' : 'Ended'}
                                    </p>
                                </div>

                                {/* <div className="p-4 bg-purple-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Session ID</p>
                                    <p className="text-xs font-mono text-purple-600 truncate">
                                        {sessionId.split('-')[1] || 'N/A'}
                                    </p>
                                </div> */}

                                <div className="p-4 bg-orange-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Attendance Rate</p>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {Math.round((students.length / 105) * 100)}%
                                    </p>
                                </div>

                            </div>
                        </CardContent>
                    </Card>
                )}

            </div>
        </div>
    );
}


export default TakeAttendance;
