import React from 'react'
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card,CardContent,CardDescription,CardHeader,CardTitle } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import API_ROUTES from '@/app/config/api.routes';
import { notFound,redirect } from 'next/navigation';
import { requireTeacherAuth } from '@/app/lib/auth';
import { AlertCircle,ArrowLeft,BookOpen,CheckCircle2,Clock,Home,LogOut,QrCode,RefreshCw,Users } from 'lucide-react';
import { AnimatePresence,motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import GenerateQR from '@/app/components/GenerateQR';
import BackButton from '@/app/components/ui/back-button';
import Logout from '@/app/components/ui/logout';
import LiveAttendance from './LiveAttendance';
import SessionClosed from './SessionClosed';

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

    const token = await requireTeacherAuth();

    const res = await fetch(`https://192.168.0.102:8082/api/v1/timetable/class/${timetableID}/${sessionId}`,{
        headers: {
            Authorization: `Bearer ${token}`,
        Cookie: `access_token=${token}`,
        },
        credentials: "include" // THIS IS MANDATORY
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

    console.log(data);
    if (data?.data?.sessionStatus === 'CLOSED' || data?.data?.sessionStatus === 'CANCELLED') {
        return <SessionClosed />
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 overflow-hidden">

            {/* Background Pattern */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
        linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),
        linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)
      `,
                    backgroundSize: "40px 40px",
                    WebkitMaskImage:
                        "radial-gradient(ellipse 100% 80% at 50% 100%, #000 50%, transparent 90%)",
                    maskImage:
                        "radial-gradient(ellipse 100% 80% at 50% 100%, #000 50%, transparent 90%)",
                }}
            />

            {/* Page Content */}
            <div className="relative z-10 max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Attendance System</h1>
                            <p className="text-gray-600 mt-1">Welcome, {cls.adminName}</p>
                        </div>
                    </div>
                    <Logout />
                </div>

                {/* Class Information Card */}
                <Card className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                    <CardContent className="pt-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">

                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/80">Subject</p>
                                    <p className="font-semibold text-lg">{cls.subjectName}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/80">Program</p>
                                    <p className="font-semibold text-lg">{cls.programName}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/80">Time</p>
                                    <p className="font-semibold text-lg">
                                        {formatTimeRange(cls.startTime,cls.endTime)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/80">Batch</p>
                                    <p className="font-semibold text-lg">
                                        {`${cls.startYear}-${cls.endYear}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/80">Semester</p>
                                    <p className="font-semibold text-lg">{cls.semester}</p>
                                </div>
                            </div>

                        </div>
                    </CardContent>
                </Card>

                <div className="grid lg:grid-cols-5 gap-6">

                    {/* QR Section */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <QrCode className="h-5 w-5" />
                                QR Code Scanner
                            </CardTitle>
                            <CardDescription>
                                Generate a QR code for students to scan (Active for 30 seconds)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <GenerateQR sessionId={sessionId as string} token={token} />
                        </CardContent>
                    </Card>

                    {/* Attendance List */}
                    <LiveAttendance
                        sessionId={+timetableID}
                        token={token as string}
                    />

                </div>

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
