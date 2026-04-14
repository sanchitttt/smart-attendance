import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import Logout from "@/app/components/ui/logout";
import DisputeRequestsPanel,{ type DisputeItem } from "@/app/components/attendance/DisputeRequestsPanel";
import API_ROUTES from "@/app/config/api.routes";
import { apiFetch } from "@/app/lib/apiFetch";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Disputes",
    description: "Review and resolve failed face-scan attendance disputes.",
};

type DisputesPageProps = {
    searchParams: Promise<{
        status?: string;
        q?: string;
    }>;
};

export default async function DisputesPage({ searchParams }: DisputesPageProps) {
    const params = await searchParams;
    const statusParam = typeof params.status === "string" ? params.status.toUpperCase() : "PENDING";
    const statusFilter: DisputeItem["status"] =
        statusParam === "APPROVED" || statusParam === "REJECTED" ? statusParam : "PENDING";
    const searchText = typeof params.q === "string" ? params.q.trim() : "";

    const res = await apiFetch(API_ROUTES.ALL_DISPUTES,{
        method: "GET",
        cache: "no-store",
    });

    if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
            redirect("/auth/login");
        }
    }

    const json = res.ok ? await res.json() : null;
    const allItems: DisputeItem[] = Array.isArray(json?.data) ? json.data : [];
    const items = allItems.filter((item) => {
        const matchesStatus = item.status === statusFilter;
        const matchesName = !searchText || item.studentName.toLowerCase().includes(searchText.toLowerCase());
        return matchesStatus && matchesName;
    });

    return (
        <div className="min-h-screen w-full relative text-gray-900">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
            <div
                className="absolute inset-0 opacity-[0.35]"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, rgba(15, 23, 42, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.06) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                    maskImage: "radial-gradient(circle at 50% 0%, black 35%, transparent 75%)",
                    WebkitMaskImage: "radial-gradient(circle at 50% 0%, black 35%, transparent 75%)",
                }}
            />

            <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
                            Dispute Requests
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600">
                            Review failed face scans and approve or deny requests.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/classes"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-white"
                        >
                            Back to classes
                        </Link>
                        <Logout />
                    </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Pending and reviewed disputes are listed here
                </div>

                <DisputeRequestsPanel
                    items={items}
                    statusFilter={statusFilter}
                    searchText={searchText}
                />
            </div>
        </div>
    );
}
