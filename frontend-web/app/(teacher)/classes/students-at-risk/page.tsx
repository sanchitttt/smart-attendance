import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import API_ROUTES from "@/app/config/api.routes";
import { apiFetch } from "@/app/lib/apiFetch";
import StudentsAtRiskPanel, { type AtRiskCourseGroup } from "@/app/components/attendance/StudentsAtRiskPanel";

export const metadata: Metadata = {
    title: "Students At Risk",
    description: "Course-wise list of students below attendance threshold.",
};

export default async function StudentsAtRiskPage() {
    const res = await apiFetch(API_ROUTES.TIMETABLE_AT_RISK_STUDENTS, {
        method: "GET",
        cache: "no-store",
    });

    if (!res.ok && (res.status === 401 || res.status === 403)) {
        redirect("/auth/login");
    }

    const json = res.ok ? await res.json() : null;
    const courses: AtRiskCourseGroup[] = Array.isArray(json?.data?.courses) ? json.data.courses : [];
    const totalAtRiskStudents = Number(json?.data?.totalAtRiskStudents ?? 0);

    return (
        <div className="min-h-screen w-full relative text-gray-900">
            <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">Students At Risk</h1>
                        <p className="text-sm text-gray-600">Course-wise attendance risk breakdown.</p>
                    </div>
                    <Link
                        href="/classes"
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-white"
                    >
                        Back to classes
                    </Link>
                </div>
                <StudentsAtRiskPanel courses={courses} totalAtRiskStudents={totalAtRiskStudents} />
            </div>
        </div>
    );
}
