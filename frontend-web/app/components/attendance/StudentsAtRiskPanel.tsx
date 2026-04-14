'use client';

import { BookOpen, Percent, UserRound, AlertCircle } from 'lucide-react';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

export type AtRiskStudent = {
    studentName: string;
    rollNo: string;
    presentClasses: number;
    totalClasses: number;
    attendancePercentage: number;
};

export type AtRiskCourseGroup = {
    course: string;
    students: AtRiskStudent[];
};

type Props = {
    courses: AtRiskCourseGroup[];
    totalAtRiskStudents: number;
    asModal?: boolean;
};

export default function StudentsAtRiskPanel({ courses, totalAtRiskStudents, asModal = false }: Props) {
    const router = useRouter();

    const sortedCourses = useMemo(() => {
        return [...courses].sort((a, b) => b.students.length - a.students.length || a.course.localeCompare(b.course));
    }, [courses]);

    return (
        <div className="space-y-4">
            {/* COMPACT HEADER SECTION */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 flex-wrap gap-2">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-gray-900">Attendance Risk</h2>
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-100 px-1.5 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200">
                            {totalAtRiskStudents}
                        </span>
                    </div>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Students below 75% threshold
                    </p>
                </div>
                
                {asModal && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => router.back()} 
                        className="h-8 text-xs font-medium border-slate-200 hover:bg-slate-50"
                    >
                        Close
                    </Button>
                )}
            </div>

            {/* CONTENT SECTION */}
            {sortedCourses.length === 0 ? (
                <Card className="border-dashed border-slate-200 bg-slate-50/50 shadow-none">
                    <CardContent className="p-8 text-center">
                        <p className="text-sm font-medium text-gray-900">No students at risk</p>
                        <p className="mt-1 text-xs text-gray-500">
                            All students are currently above the attendance threshold.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {sortedCourses.map((group) => (
                        <Card
                            key={group.course}
                            className="overflow-hidden border border-slate-200/70 bg-white/80 shadow-sm transition-all hover:shadow-md"
                        >
                            {/* Course Sub-header */}
                            <div className="bg-slate-50/50 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                                    <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]">
                                        {group.course}
                                    </span>
                                </div>
                                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">
                                    {group.students.length} Total
                                </span>
                            </div>

                            <CardContent className="p-3 space-y-2">
                                {group.students.map((student) => (
                                    <div
                                        key={`${group.course}-${student.rollNo}`}
                                        className="group relative flex items-center justify-between rounded-lg border border-slate-100 bg-white p-2.5 transition-colors hover:border-amber-200 hover:bg-amber-50/30"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                                <UserRound className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-semibold text-gray-900">
                                                    {student.studentName}
                                                </p>
                                                <p className="text-[10px] text-gray-500">
                                                    ID: {student.rollNo} • {student.presentClasses}/{student.totalClasses} classes
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-1">
                                            <div className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-bold text-amber-700 ring-1 ring-amber-100">
                                                {student.attendancePercentage}
                                                <Percent className="h-2.5 w-2.5" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}