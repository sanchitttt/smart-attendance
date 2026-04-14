import { redirect } from "next/navigation";
import API_ROUTES from "@/app/config/api.routes";
import { apiFetch } from "@/app/lib/apiFetch";
import StudentsAtRiskPanel, { type AtRiskCourseGroup } from "@/app/components/attendance/StudentsAtRiskPanel";

export default async function StudentsAtRiskModalPage() {
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
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm p-3 sm:p-6">
            <div className="mx-auto max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75 shadow-xl p-4 sm:p-6">
                <StudentsAtRiskPanel
                    courses={courses}
                    totalAtRiskStudents={totalAtRiskStudents}
                    asModal
                />
            </div>
        </div>
    );
}
