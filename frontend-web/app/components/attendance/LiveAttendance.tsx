'use client';

import { useEffect,useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { Card,CardContent,CardHeader,CardTitle,CardDescription } from "@/app/components/ui/card";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Users,CheckCircle2 } from "lucide-react";
import { AnimatePresence,motion } from "framer-motion";
import API_ROUTES from "@/app/config/api.routes";
import { apiFetch } from "@/app/lib/apiFetch";
import toast from "react-hot-toast";

type Student = {
    userId: number;
    name: string;
    rollNo: string;
};

type Props = {
    sessionId: number;
    className: string;
    active?: boolean; // <-- only start polling when active is true
};

export default function LiveAttendance({ sessionId,className,active }: Props) {
    const [students,setStudents] = useState<Student[]>([]);

    useEffect(() => {
        if (!active) return;

        // Record the time when the polling starts
        const startTime = Date.now();
        const TIMEOUT_LIMIT = 35000; // 35 seconds in milliseconds

        const fetchAttendance = async () => {
            try {
                const res = await fetch(
                    API_ROUTES.SESSION_ATTENDANCE(sessionId),
                    {
                        headers: { 'Content-Type': 'application/json' },
                        credentials: "include",
                    }
                );

                if (res.ok) {
                    const json = await res.json();
                    if (!json.error) {
                        setStudents(json.data);
                    }
                } else {
                    toast.error("Something went wrong while fetching students!");
                }
            } catch (err) {
                toast.error("Something went wrong!");
                console.error("Polling error:",err);
            }
        };

        // Initial fetch
        fetchAttendance();

        // Set up interval
        const interval = setInterval(() => {
            const timeElapsed = Date.now() - startTime;

            if (timeElapsed >= TIMEOUT_LIMIT) {
                clearInterval(interval);
                console.log("Polling stopped after 35 seconds.");
                return;
            }

            fetchAttendance();
        },3000);

        return () => clearInterval(interval);
    },[sessionId,active]);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key="live-attendance-card"
                initial={{ opacity: 0,scale: 0.95,y: 20 }}
                animate={{ opacity: 1,scale: 1,y: 0 }}
                exit={{ opacity: 0,scale: 0.95,y: -20 }}
                transition={{ duration: 0.4 }}
                className={`${className}`}
            >
                <Card className="w-full border border-slate-200/70 bg-white/75 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-slate-700" />
                                Live Attendance
                            </span>

                            <Badge variant="secondary" className="text-base px-3 py-1">
                                {students.length}
                            </Badge>
                        </CardTitle>

                        <CardDescription>
                            Students who have marked their attendance
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <ScrollArea className="h-[520px] pr-4">

                            {students.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-14 text-gray-500">
                                    <Users className="h-12 w-12 mb-3 opacity-25" />
                                    <p className="font-medium text-gray-700">No check-ins yet</p>
                                    <p className="text-sm text-gray-500 mt-1">This list updates automatically.</p>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    <AnimatePresence>
                                        {students.map((student) => (
                                            <motion.div
                                                key={student.userId}
                                                initial={{ opacity: 0,x: -20 }}
                                                animate={{ opacity: 1,x: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="flex items-center justify-between p-3 bg-green-50/70 border border-green-200/80 rounded-xl"
                                            >
                                                <div className="flex items-center gap-3">

                                                    <div className="h-9 w-9 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                                                        {student.name.charAt(0)}
                                                    </div>

                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {student.name}
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            {student.rollNo}
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
            </motion.div>

        </AnimatePresence>
    );
}