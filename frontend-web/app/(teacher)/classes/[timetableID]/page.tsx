import React from 'react'
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card,CardContent,CardDescription,CardHeader,CardTitle } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import API_ROUTES from '@/app/config/api.routes';
import { redirect } from 'next/navigation';
import { requireTeacherAuth } from '@/app/lib/auth';
import { ArrowLeft,BookOpen,CheckCircle2,Clock,LogOut,QrCode,RefreshCw,Users } from 'lucide-react';
import { AnimatePresence,motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import GenerateQR from '@/app/components/GenerateQR';
import BackButton from '@/app/components/ui/back-button';
import Logout from '@/app/components/ui/logout';

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



type Props = {
    params: {
        timetableID: string;
    };
};

async function TakeAttendance({ params }: Props) {
    console.log(params)
    const { timetableID } = await params;
    const onBack = () => { };
    const onLogout = () => { };
    const students = [];
    const isActive = false;
    const timeLeft = 30;
    const progressPercentage = 0;
    const startNewSession = () => { };
    const sessionId = "asodasd";

    const token = await requireTeacherAuth();

    const res = await fetch(`${API_ROUTES.CLASS_BY_ID}/${timetableID}`,{
        headers: {
            Cookie: `access_token=${token}`,
        }
    });

    if (res.status == 403) {
        redirect('/teacher-login');
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
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-7xl mx-auto space-y-6">
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
                                    <p className="font-semibold text-lg">{formatTimeRange(cls.startTime,cls.endTime)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/80">Batch</p>
                                    <p className="font-semibold text-lg">{`${cls.startYear}-${cls.endYear}`}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/80">Semester</p>
                                    <p className="font-semibold text-lg">{cls.semester}</p>                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid lg:grid-cols-5 gap-6">
                    {/* QR Code Section - Now takes 3 columns */}
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
                            <GenerateQR timetableEntryID={timetableID} />
                        </CardContent>
                    </Card>

                    {/* Attendance List - Now takes 2 columns */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Live Attendance
                                </span>
                                <Badge variant="secondary" className="text-lg px-3 py-1">
                                    {students.length}
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                Students who have marked their attendance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[500px] pr-4">
                                {students.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                        <Users className="h-12 w-12 mb-2 opacity-30" />
                                        <p>No students have checked in yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <AnimatePresence>
                                            {students.map((student,index) => (
                                                <motion.div
                                                    key={student.id}
                                                    initial={{ opacity: 0,x: -20 }}
                                                    animate={{ opacity: 1,x: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white font-medium">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{student.name}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {student.timestamp.toLocaleTimeString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                {/* Statistics Summary */}
                {students.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Session Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Total Students</p>
                                    <p className="text-2xl font-bold text-blue-600">{students.length}</p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Status</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {isActive ? 'Active' : 'Ended'}
                                    </p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Session ID</p>
                                    <p className="text-xs font-mono text-purple-600 truncate">
                                        {sessionId.split('-')[1] || 'N/A'}
                                    </p>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Attendance Rate</p>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {/*todo change hardcoded 105*/}
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
