'use client';

import { Button } from '@/app/components/ui/button';
import { Card,CardContent } from '@/app/components/ui/card';
import {
    AlertTriangle,
    BookOpen,
    CalendarCheck2,
    Clock,
    GraduationCap,
    Loader2,
    Percent,
    TrendingUp,
    Users
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from "next/navigation";
import { useMemo,useState } from 'react';
import type { ReactNode } from 'react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import API_ROUTES from '@/app/config/api.routes';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';

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
    summaryData?: unknown;
}

type ChartPoint = {
    date: string;
    counts: Record<string,number>;
};

type ChartSeries = {
    course: string;
    color: string;
    values: number[];
    total: number;
};

type CourseMetric = {
    course: string;
    totalClasses: number;
    averageAttendance: number;
    atRiskStudents: number;
};

const CHART_COLORS = [
    "#4f46e5",
    "#0891b2",
    "#16a34a",
    "#f59e0b",
    "#e11d48",
    "#7c3aed",
    "#2563eb",
    "#ea580c",
    "#0f766e",
];

type ParsedSummary = {
    hasData: boolean;
    points: ChartPoint[];
    series: ChartSeries[];
    metrics: CourseMetric[];
    totalClasses: number;
    averageAttendance: number;
    atRiskStudents: number;
};

function toNumber(value: unknown): number {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return 0;
}

function toStringValue(value: unknown): string {
    return typeof value === "string" ? value : "";
}

function parseSummaryData(summaryData: unknown): ParsedSummary {
    if (!summaryData || typeof summaryData !== "object") {
        return {
            hasData: false,
            points: [],
            series: [],
            metrics: [],
            totalClasses: 0,
            averageAttendance: 0,
            atRiskStudents: 0,
        };
    }

    const root = summaryData as Record<string,unknown>;
    const coursesRaw =
        (Array.isArray(root.courseSummaries) && root.courseSummaries) ||
        (Array.isArray(root.courses) && root.courses) ||
        [];

    if (!coursesRaw.length) {
        return {
            hasData: false,
            points: [],
            series: [],
            metrics: [],
            totalClasses: 0,
            averageAttendance: 0,
            atRiskStudents: 0,
        };
    }

    const parsedCourses = coursesRaw
        .map((entry) => {
            if (!entry || typeof entry !== "object") return null;
            const item = entry as Record<string,unknown>;
            const course = toStringValue(item.course || item.subject || item.courseName);
            const trendRaw =
                (Array.isArray(item.trend) && item.trend) ||
                (Array.isArray(item.periodTrend) && item.periodTrend) ||
                (Array.isArray(item.history) && item.history) ||
                [];
            if (!course || !trendRaw.length) return null;
            return {
                course,
                trend: trendRaw
                    .map((point) => {
                        if (!point || typeof point !== "object") return null;
                        const trendPoint = point as Record<string,unknown>;
                        const date = toStringValue(trendPoint.date || trendPoint.classDate);
                        const count = toNumber(trendPoint.count ?? trendPoint.classesCount ?? trendPoint.periodCount);
                        if (!date) return null;
                        return { date,count };
                    })
                    .filter((point): point is { date: string; count: number } => Boolean(point)),
                totalClasses: toNumber(item.totalClasses ?? item.totalClassesConducted ?? item.classCount),
                averageAttendance: toNumber(item.averageAttendance ?? item.averageAttendancePercentage ?? item.avgAttendance),
                atRiskStudents: toNumber(item.atRiskStudents ?? item.attendanceAtRiskStudents),
            };
        })
        .filter((course): course is {
            course: string;
            trend: { date: string; count: number }[];
            totalClasses: number;
            averageAttendance: number;
            atRiskStudents: number;
        } => Boolean(course && course.trend.length));

    if (!parsedCourses.length) {
        return {
            hasData: false,
            points: [],
            series: [],
            metrics: [],
            totalClasses: 0,
            averageAttendance: 0,
            atRiskStudents: 0,
        };
    }

    const uniqueDates = Array.from(new Set(parsedCourses.flatMap((item) => item.trend.map((p) => p.date))))
        .sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
    if (!uniqueDates.length) {
        return {
            hasData: false,
            points: [],
            series: [],
            metrics: [],
            totalClasses: 0,
            averageAttendance: 0,
            atRiskStudents: 0,
        };
    }

    const points: ChartPoint[] = uniqueDates.map((date) => {
        const counts: Record<string,number> = {};
        parsedCourses.forEach((course) => {
            const hit = course.trend.find((p) => p.date === date);
            counts[course.course] = hit?.count ?? 0;
        });
        return { date,counts };
    });

    const series: ChartSeries[] = parsedCourses.map((course,idx) => {
        const values = points.map((point) => point.counts[course.course] ?? 0);
        const derivedTotal = values.reduce((acc,curr) => acc + curr,0);
        return {
            course: course.course,
            color: CHART_COLORS[idx % CHART_COLORS.length],
            values,
            total: course.totalClasses > 0 ? course.totalClasses : derivedTotal,
        };
    });

    const metrics: CourseMetric[] = series.map((item) => {
        const matched = parsedCourses.find((course) => course.course === item.course);
        return {
            course: item.course,
            totalClasses: item.total,
            averageAttendance: matched?.averageAttendance ?? 0,
            atRiskStudents: matched?.atRiskStudents ?? 0,
        };
    });

    const rootTotal = toNumber(root.totalClassesConducted ?? root.totalClasses);
    const rootAvg = toNumber(root.averageAttendance ?? root.averageAttendancePercentage);
    const rootRisk = toNumber(root.atRiskStudents ?? root.attendanceAtRiskStudents);

    const totalClasses = rootTotal || metrics.reduce((acc,item) => acc + item.totalClasses,0);
    const averageAttendance = rootAvg || Math.round(metrics.reduce((acc,item) => acc + item.averageAttendance,0) / Math.max(metrics.length,1));
    const atRiskStudents = rootRisk || metrics.reduce((acc,item) => acc + item.atRiskStudents,0);

    return { hasData: true,points,series,metrics,totalClasses,averageAttendance,atRiskStudents };
}

export default function ClassesUI({ classes,summaryData }: Props) {
    const router = useRouter();
    const [loading,setLoading] = useState(false);
    const [selectedCourse,setSelectedCourse] = useState("all");
    console.log(summaryData);
    const parsedSummary = useMemo(() => parseSummaryData(summaryData),[summaryData]);
    const { points,series,metrics } = parsedSummary;
    const maxY = Math.max(1,...series.flatMap((item) => item.values));
    const chartData = useMemo(() => {
        return points.map((point) => {
            const parsedDate = new Date(point.date);
            const dateLabel = Number.isNaN(parsedDate.getTime())
                ? point.date
                : parsedDate.toLocaleDateString("en-IN",{ day: "numeric",month: "short" });
            const row: Record<string,string | number> = {
                date: point.date,
                dateLabel,
            };
            series.forEach((line) => {
                row[line.course] = point.counts[line.course] ?? 0;
            });
            return row;
        });
    },[points,series]);
    const selectedSeries = selectedCourse === "all"
        ? null
        : series.find((item) => item.course === selectedCourse) ?? null;
    const selectedMetric = selectedSeries
        ? metrics.find((item) => item.course === selectedSeries.course) ?? null
        : null;
    const totalClassesConducted = selectedMetric
        ? selectedMetric.totalClasses
        : parsedSummary.totalClasses;
    const selectedAttendance = selectedMetric
        ? selectedMetric.averageAttendance
        : parsedSummary.averageAttendance;
    const atRiskStudents = selectedMetric
        ? selectedMetric.atRiskStudents
        : parsedSummary.atRiskStudents;
    console.log('Classes => ',classes);


    return (
        <div className="space-y-4">
            {parsedSummary.hasData ? (
                <>
                    <div className="space-y-3">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm font-semibold text-gray-900">Overall attendance summary</p>
                            <div className="w-full sm:w-[260px]">
                                <label className="text-[11px] text-gray-500">View by course</label>
                                <select
                                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-200"
                                    value={selectedCourse}
                                    onChange={(event) => setSelectedCourse(event.target.value)}
                                >
                                    <option value="all">All</option>
                                    {series.map((item) => (
                                        <option key={`summary-${item.course}`} value={item.course}>
                                            {item.course}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            <Card className="border border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
                                <CardContent className="p-5">
                                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                                        <CalendarCheck2 className="h-4 w-4" />
                                    </div>
                                    <p className="mt-3 text-xs text-gray-500">Total classes conducted</p>
                                    <p className="mt-1 text-2xl font-semibold text-gray-900">{totalClassesConducted}</p>
                                    <p className="mt-1 text-xs text-gray-500">{selectedSeries ? `Showing ${selectedSeries.course}` : "Showing all courses"}</p>

                                </CardContent>
                            </Card>

                            <Card className="border border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
                                <CardContent className="p-5">
                                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                                        <Percent className="h-4 w-4" />
                                    </div>
                                    <p className="mt-3 text-xs text-gray-500">Average attendance</p>
                                    <p className="mt-1 text-2xl font-semibold text-gray-900">{selectedAttendance}%</p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {selectedSeries ? `For ${selectedSeries.course}.` : "Aggregated across all courses."}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm sm:col-span-2 xl:col-span-1">
                                <CardContent className="p-5">
                                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                                        <AlertTriangle className="h-4 w-4" />
                                    </div>
                                    <p className="mt-3 text-xs text-gray-500">Students at attendance risk</p>
                                    <p className="mt-1 text-2xl font-semibold text-gray-900">{atRiskStudents}</p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {atRiskStudents === 0 ? "No students are currently at risk." : "Students below attendance threshold."}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <Card className="border border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
                <CardContent className="p-5 sm:p-6 space-y-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                Teaching trend by course
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                                Distinct class dates on X-axis with one line per course.
                            </p>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                            <TrendingUp className="h-3.5 w-3.5" />
                            <span>{series.length} active courses</span>
                        </div>
                    </div>

                    <div className="h-[320px] w-full rounded-xl border border-slate-200/60 bg-white/70 px-2 py-2 overflow-x-auto">
                        <div className="min-w-[600px] h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData}
                                    margin={{ top: 12,right: 20,left: 2,bottom: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="4 6" stroke="rgba(148, 163, 184, 0.28)" />
                                    <XAxis
                                        dataKey="dateLabel"
                                        tick={{ fill: "#64748b",fontSize: 11 }}
                                        axisLine={{ stroke: "rgba(100, 116, 139, 0.35)" }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        domain={[0,Math.max(maxY,1)]}
                                        tick={{ fill: "#64748b",fontSize: 11 }}
                                        axisLine={{ stroke: "rgba(100, 116, 139, 0.35)" }}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: 10,
                                            border: "1px solid rgba(148,163,184,0.35)",
                                            boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                                            backgroundColor: "rgba(255,255,255,0.96)",
                                        }}
                                        labelStyle={{ color: "#334155",fontWeight: 600 }}
                                        formatter={(value,name) => [`${Number(value ?? 0)} attended`,String(name)]}
                                        labelFormatter={(label,entries) => {
                                            const rawDate = entries?.[0]?.payload?.date as string | undefined;
                                            if (!rawDate) return label;
                                            const parsed = new Date(rawDate);
                                            return Number.isNaN(parsed.getTime())
                                                ? rawDate
                                                : parsed.toLocaleDateString("en-IN",{ day: "numeric",month: "short",year: "numeric" });
                                        }}
                                    />
                                    {series.map((line) => (
                                        <Line
                                            key={line.course}
                                            type="monotone"
                                            dataKey={line.course}
                                            stroke={line.color}
                                            strokeWidth={2.6}
                                            dot={{ r: 3.5,stroke: "#fff",strokeWidth: 1.5 }}
                                            activeDot={{ r: 5 }}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {series.map((line) => {
                            const width = `${Math.max((line.total / Math.max(...series.map((it) => it.total),1)) * 100,8)}%`;
                            return (
                                <div
                                    key={`${line.course}-total`}
                                    className="rounded-xl border border-slate-200/70 bg-white/70 px-3 py-3"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-medium text-gray-900 truncate">{line.course}</p>
                                        <span className="text-xs text-gray-500">{line.total} attended</span>
                                    </div>
                                    <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{ width,backgroundColor: line.color }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-3">
                        {series.map((line) => (
                            <div key={`${line.course}-legend`} className="inline-flex items-center gap-2 text-xs text-gray-600">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: line.color }} />
                                <span className="truncate max-w-[180px]">{line.course}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
                </>
            ) : (
                <Card className="border border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
                    <CardContent className="p-8 sm:p-10">
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-slate-900/5 text-slate-700 flex items-center justify-center ring-1 ring-slate-900/10">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <p className="text-lg font-semibold text-gray-900">No summary data found</p>
                            <p className="text-sm text-gray-600 max-w-lg">
                                Attendance summary and trend charts will appear once timetable summary data is available.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

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
                                    {/* todo: Change != to == */}
                                    {(cls.status == 'old' || cls.status == 'current') && (
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

                                                        if (!res.ok) {
                                                            if (res.status == 401 || res.status == 403) {
                                                                try {
                                                                    await signOut(auth);
                                                                    await fetch(API_ROUTES.LOGOUT,{
                                                                        method: "POST",
                                                                        credentials: "include",
                                                                    });
                                                                    toast.error("Your session timed out!");
                                                                    router.replace("/auth/login");
                                                                } catch (error) {
                                                                    console.error("Logout error:");
                                                                    console.log(error);
                                                                    toast.error("Failed to sign out. Please try again.")
                                                                } finally {
                                                                    // setIsLoading(false)
                                                                }
                                                            }
                                                        }
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

