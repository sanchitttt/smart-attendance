"use client";

import { useEffect,useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { Card,CardContent,CardHeader,CardTitle,CardDescription } from "@/app/components/ui/card";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Users,CheckCircle2 } from "lucide-react";
import { AnimatePresence,motion } from "framer-motion";

type Student = {
    userId: number;
    name: string;
    rollNo: string;
};

type Props = {
    sessionId: number;
    token: string;
    className: string;
    active?: boolean; // <-- only start polling when active is true
};

export default function LiveAttendance({ sessionId,token,className,active }: Props) {
    console.log('Active inside liveattendance =>',active);
    const [students,setStudents] = useState<Student[]>([]);

    useEffect(() => {
        if (!active) return; // do nothing if not active
        const fetchAttendance = async () => {
            try {
                console.log(sessionId);
                const res = await fetch(
                    `https://quantity-sea-organizer-made.trycloudflare.com/api/v1/attendance/session/${sessionId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Cookie: `access_token=${token}`,
                        },
                        credentials: "include",
                    }
                );

                const json = await res.json();
                console.log(json);
                if (!json.error) {
                    setStudents(json.data);
                }

            } catch (err) {
                console.error("Polling error:",err);
            }
        };

        fetchAttendance();

        const interval = setInterval(fetchAttendance,3000);

        return () => clearInterval(interval);

    },[sessionId,token,active]);

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
                <Card className={`w-[100%]`}>
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
                                        {students.map((student) => (
                                            <motion.div
                                                key={student.userId}
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