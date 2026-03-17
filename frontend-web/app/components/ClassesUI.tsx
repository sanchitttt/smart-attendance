'use client';

import { Button } from '@/app/components/ui/button';
import { Card,CardContent } from '@/app/components/ui/card';
import {
    BookOpen,
    Clock,
    GraduationCap,
    Loader2,
    Users
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from "next/navigation";
import { useState } from 'react';
import type { ReactNode } from 'react';
import API_ROUTES from '@/app/config/api.routes';

interface ClassInfo {
    timetableID: number;
    subject: string;
    timeSlot: string;
    batch: string;
    semester: number;
    program: string;
    status: 'old' | 'current' | 'upcoming';
}

interface Props {
    classes: ClassInfo[];
}

export default function ClassesUI({ classes }: Props) {
    const router = useRouter();
    const [loading,setLoading] = useState(false);
    console.log('Classes => ',classes);


    return (
        <div className="space-y-4">
            {classes.length === 0 ? (
                <Card className="border border-slate-200/70 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
                    <CardContent className="p-8 sm:p-10">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-slate-900/5 text-slate-700 flex items-center justify-center ring-1 ring-slate-900/10">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-semibold text-gray-900">
                                    No classes to show
                                </p>
                                <p className="text-sm text-gray-600 max-w-md">
                                    When your timetable is available, your classes for the current period will appear here.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
            {
                classes.map((cls,i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0,y: 20 }}
                        animate={{ opacity: 1,y: 0 }}
                    >
                        <Card className="group border border-slate-200/70 bg-white/75 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm transition hover:shadow-md hover:-translate-y-[1px]">
                            <CardContent className="p-5 sm:p-6">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900 truncate">
                                            {cls.subject}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                            {cls.program} • Semester {cls.semester}
                                        </p>
                                    </div>

                                    <StatusPill status={cls.status} />
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <Info icon={<Clock className="h-4 w-4 flex-shrink-0" />} label="Time" value={cls.timeSlot} />
                                    <Info icon={<Users className="h-4 w-4 flex-shrink-0" />} label="Batch" value={cls.batch} />
                                    <Info icon={<GraduationCap className="h-4 w-4 flex-shrink-0" />} label="Program" value={cls.program} />
                                    <Info icon={<BookOpen className="h-4 w-4 flex-shrink-0" />} label="Semester" value={`Semester ${cls.semester}`} />
                                </div>

                                {/* Change back to old */}
                                {/* {cls.status === 'old' && (
                                        <div className="mt-4 pt-4 border-t">
                                            <Button>Take Attendance</Button>
                                        </div>
                                    )} */}
                                {/* Change back to old */}
                                {cls.status === 'old' && (
                                    <div className="mt-6 pt-4 border-t border-slate-200/70 flex items-center justify-between gap-3">
                                        <Button
                                            className="w-full sm:w-auto disabled:opacity-60 shadow-sm"
                                            disabled={loading}
                                            onClick={async () => {

                                                setLoading(true);

                                                try {
                                                    const res = await fetch(
                                                        API_ROUTES.CREATE_SESSION,
                                                        {
                                                            method: "POST",
                                                            credentials: "include",
                                                            headers: {
                                                                "Content-Type": "application/json",
                                                            },
                                                            body: JSON.stringify({
                                                                timetableEntryId: cls.timetableID
                                                            })
                                                        }
                                                    );
                                                    
                                                    console.log(res);
                                                    const json = await res.json();

                                                    if (json.error) {
                                                        alert("Failed to create session");
                                                        setLoading(false);
                                                        return;
                                                    }

                                                    const sessionId = json.data.sessionId;

                                                    router.push(`/classes/${cls.timetableID}?sessionId=${sessionId}`);

                                                } catch (err) {
                                                    console.error(err);
                                                    setLoading(false);
                                                }
                                            }}
                                        >
                                            {loading ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Creating Session...
                                                </span>
                                            ) : (
                                                "Take Attendance"
                                            )}
                                        </Button>
                                    </div>
                                )}

                                {/* Change back to old */}
                                {cls.status === 'old' && (
                                    <div className="mt-3">
                                        <p className="text-xs sm:text-sm text-gray-500">
                                            This class has ended
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))
            }
            </div>
        </div>

    );
}

type InfoProps = {
    icon: ReactNode;
    label: string;
    value: string;
};

function Info({ icon,label,value }: InfoProps) {
    return (
        <div className="flex items-start gap-2.5 rounded-xl border border-slate-200/70 bg-white/60 px-3 py-2.5 text-gray-700">
            <div className="mt-0.5 text-slate-600">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[11px] leading-4 text-gray-500">{label}</p>
                <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
            </div>
        </div>
    );
}

function StatusPill({ status }: { status: ClassInfo["status"] }) {
    const styleByStatus: Record<ClassInfo["status"],string> = {
        old: "bg-slate-900/5 text-slate-700 ring-1 ring-slate-900/10",
        current: "bg-indigo-600/10 text-indigo-700 ring-1 ring-indigo-600/15",
        upcoming: "bg-blue-600/10 text-blue-700 ring-1 ring-blue-600/15",
    };

    const labelByStatus: Record<ClassInfo["status"],string> = {
        old: "Ended",
        current: "In progress",
        upcoming: "Upcoming",
    };

    return (
        <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${styleByStatus[status]}`}>
            {labelByStatus[status]}
        </span>
    );
}

