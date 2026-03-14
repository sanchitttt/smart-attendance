'use client';

import { Button } from '@/app/components/ui/button';
import { Card,CardContent } from '@/app/components/ui/card';
import {
    BookOpen,
    Calendar,
    Clock,
    GraduationCap,
    LogOut,
    Users
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from "next/navigation";

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

    return (
        <div className="grid gap-4" >
            {
                classes.map((cls,i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0,y: 20 }}
                        animate={{ opacity: 1,y: 0 }}
                    >
                        <Card className="transition hover:shadow-lg">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold mb-4">
                                    {cls.subject}
                                </h3>

                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                                    <Info icon={<Clock className="h-4 w-4 flex-shrink-0" />} label="Time" value={cls.timeSlot} />
                                    <Info icon={<GraduationCap className="h-4 w-4 flex-shrink-0" />} label="Program" value={cls.program} />
                                    <Info icon={<Users className="h-4 w-4 flex-shrink-0" />} label="Batch" value={cls.batch} />
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
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <Button
                                            className="w-full md:w-auto"
                                            disabled={false}
                                            onClick={() => {
                                                console.log(`/classes/${cls.timetableID}`);
                                                router.push(`/classes/${cls.timetableID}`);
                                            }}
                                        >
                                            Take Attendance
                                        </Button>
                                    </div>
                                )}

                                {/* Change back to old */}
                                {cls.status === 'old' && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-500">
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

    );
}

function Info({ icon,label,value }: any) {
    return (
        <div className="flex items-center gap-2 text-gray-600">
            {icon}
            <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="font-medium">{value}</p>
            </div>
        </div>
    );
}

