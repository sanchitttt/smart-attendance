import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
    ArrowLeft,
    BookOpen,
    CalendarCheck2,
    GraduationCap,
    Percent,
    UserRound,
} from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import API_ROUTES from "@/app/config/api.routes";
import { apiFetch } from "@/app/lib/apiFetch";

type SubjectSummary = {
    subjectName: string;
    totalClasses: number;
    attendedClasses: number;
    attendancePercentage: number;
};

type StudentProfile = {
    studentName: string;
    rollNo: string;
    programName: string;
    batch: string;
    masterImageUrl: string;
    overallAttendancePercentage: number;
    totalAttendedClasses: number;
    totalClasses: number;
    subjects: SubjectSummary[];
};

type PageProps = {
    params: Promise<{ rollNumber: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { rollNumber } = await params;
    return {
        title: `Student ${rollNumber}`,
        description: "Teacher view of student attendance profile and master image.",
    };
}

export default async function StudentProfilePage({ params }: PageProps) {
    const { rollNumber } = await params;
    const res = await apiFetch(API_ROUTES.STUDENT_PROFILE(rollNumber), {
        method: "GET",
        cache: "no-store",
    });

    if (res.status === 401 || res.status === 403) {
        redirect("/auth/login");
    }

    if (res.status === 404 || res.status === 400) {
        notFound();
    }

    const data: StudentProfile | null = res.ok ? await res.json() : null;

    if (!data) {
        notFound();
    }

    const subjectRows = [...(data.subjects ?? [])].sort(
        (a, b) => a.attendancePercentage - b.attendancePercentage || a.subjectName.localeCompare(b.subjectName)
    );
    const masterImageUrl =
        data.masterImageUrl?.startsWith("http://") || data.masterImageUrl?.startsWith("https://")
            ? data.masterImageUrl
            : API_ROUTES.STUDENT_MASTER_IMAGE(rollNumber);

    return (
        <div className="min-h-screen w-full relative text-gray-900">
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: `
          repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.08) 0, rgba(0, 0, 0, 0.08) 1px, transparent 1px, transparent 20px),
          repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.08) 0, rgba(0, 0, 0, 0.08) 1px, transparent 1px, transparent 20px)
        `,
                    backgroundSize: "40px 40px",
                }}
            />

            <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <Link
                            href="/classes"
                            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to classes
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
                            Student Profile
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600">
                            Attendance summary for <span className="font-medium text-gray-800">{data.studentName}</span>
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
                    <Card className="border border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
                        <CardContent className="p-5 sm:p-6 space-y-5">
                            <div className="relative mx-auto w-full max-w-[220px] overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-100 aspect-[4/5]">
                                <Image
                                    src={masterImageUrl}
                                    alt={`${data.studentName} master face`}
                                    fill
                                    unoptimized
                                    sizes="(max-width: 1024px) 220px, 220px"
                                    className="object-cover"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-3">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-600/10 text-indigo-700 flex items-center justify-center ring-1 ring-indigo-600/10 flex-shrink-0">
                                        <UserRound className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] leading-4 text-gray-500">Student name</p>
                                        <p className="text-sm sm:text-base font-semibold text-gray-900">{data.studentName}</p>
                                    </div>
                                </div>

                                <InfoTile icon={<BookOpen className="h-5 w-5" />} label="Roll number" value={data.rollNo} />
                                <InfoTile icon={<GraduationCap className="h-5 w-5" />} label="Program" value={data.programName} />
                                <InfoTile icon={<CalendarCheck2 className="h-5 w-5" />} label="Batch" value={data.batch} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <div className="grid gap-3 sm:grid-cols-3">
                            <SummaryCard
                                icon={<Percent className="h-4 w-4" />}
                                title="Overall attendance"
                                value={`${data.overallAttendancePercentage}%`}
                                hint="Across subjects taught by you"
                                tint="indigo"
                            />
                            <SummaryCard
                                icon={<CalendarCheck2 className="h-4 w-4" />}
                                title="Classes attended"
                                value={String(data.totalAttendedClasses)}
                                hint="Successful attendance records"
                                tint="emerald"
                            />
                            <SummaryCard
                                icon={<BookOpen className="h-4 w-4" />}
                                title="Total classes"
                                value={String(data.totalClasses)}
                                hint="Classes conducted by your subjects"
                                tint="amber"
                            />
                        </div>

                        <Card className="border border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
                            <CardContent className="p-5 sm:p-6 space-y-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Subject-wise attendance</p>
                                    <p className="text-xs sm:text-sm text-gray-500">
                                        Summary of attendance for the subjects you teach to this student&apos;s batch.
                                    </p>
                                </div>

                                {subjectRows.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
                                        <p className="text-base font-semibold text-gray-900">No attendance data yet</p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Subject summaries will appear once class sessions are available.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {subjectRows.map((subject) => {
                                            const progress = Math.max(0, Math.min(100, Number(subject.attendancePercentage ?? 0)));
                                            const badgeClass =
                                                progress >= 90
                                                    ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                                                    : progress >= 75
                                                        ? "bg-indigo-50 text-indigo-700 ring-indigo-100"
                                                        : "bg-amber-50 text-amber-700 ring-amber-100";

                                            return (
                                                <div
                                                    key={subject.subjectName}
                                                    className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm"
                                                >
                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">{subject.subjectName}</p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Attended {subject.attendedClasses} of {subject.totalClasses} classes
                                                            </p>
                                                        </div>
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${badgeClass}`}>
                                                            {subject.attendancePercentage}%
                                                        </span>
                                                    </div>

                                                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white/60 px-3 py-3">
            <div className="h-10 w-10 rounded-xl bg-slate-900/5 text-slate-700 flex items-center justify-center ring-1 ring-slate-900/10 flex-shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[11px] leading-4 text-gray-500">{label}</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{value}</p>
            </div>
        </div>
    );
}

function SummaryCard({
    icon,
    title,
    value,
    hint,
    tint,
}: {
    icon: ReactNode;
    title: string;
    value: string;
    hint: string;
    tint: "indigo" | "emerald" | "amber";
}) {
    const tintClass = {
        indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
        emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
        amber: "bg-amber-50 text-amber-700 ring-amber-100",
    }[tint];

    return (
        <Card className="border border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
            <CardContent className="p-5">
                <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ring-1 ${tintClass}`}>
                    {icon}
                </div>
                <p className="mt-3 text-xs text-gray-500">{title}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
                <p className="mt-1 text-xs text-gray-500">{hint}</p>
            </CardContent>
        </Card>
    );
}
