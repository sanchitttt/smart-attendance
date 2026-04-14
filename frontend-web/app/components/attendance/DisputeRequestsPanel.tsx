import { Card,CardContent,CardHeader,CardTitle,CardDescription } from '@/app/components/ui/card';
import { AlertTriangle, Search } from 'lucide-react';
import { API_BASE_URL } from '@/app/config/api.routes';
import DisputeReviewActions from '@/app/components/attendance/DisputeReviewActions';

export type DisputeItem = {
    disputeId: number;
    attendanceId: number;
    timetableEntryId?: number;
    studentName: string;
    rollNo: string;
    subjectName: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    reason?: string;
    teacherComment?: string;
    createdAt?: string;
    submittedImageUrl: string;
    masterImageUrl: string;
};

type Props = {
    items: DisputeItem[];
    statusFilter: 'PENDING' | 'APPROVED' | 'REJECTED';
    searchText: string;
};

function resolveUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const backendOrigin = (API_BASE_URL ?? '').replace(/\/api\/v1\/?$/,'');
    return `${backendOrigin}${path}`;
}

export default function DisputeRequestsPanel({ items, statusFilter, searchText }: Props) {
    return (
        <Card className="border border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {/* <AlertTriangle className="h-5 w-5 text-amber-600" /> */}
                    Attendance Disputes
                </CardTitle>
                <CardDescription>Students can raise disputes for failed face scans.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between" method="GET">
                    <div className="inline-flex items-center rounded-lg border border-slate-200/70 bg-white/70 p-1">
                        {(['PENDING','APPROVED','REJECTED'] as const).map((status) => (
                            <a
                                key={status}
                                href={`?status=${status}&q=${encodeURIComponent(searchText)}`}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                                    statusFilter === status
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {status.charAt(0) + status.slice(1).toLowerCase()}
                            </a>
                        ))}
                    </div>

                    <div className="relative w-full md:max-w-xs">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            name="q"
                            defaultValue={searchText}
                            placeholder="Search by student name"
                            className="w-full rounded-lg border border-slate-200/70 bg-white/80 pl-9 pr-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                        <input type="hidden" name="status" value={statusFilter} />
                    </div>
                </form>

                {items.length === 0 ? (
                    <div className="rounded-xl border border-slate-200/70 bg-white/70 p-8 text-center">
                        <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-slate-900/5 text-slate-700 flex items-center justify-center ring-1 ring-slate-900/10">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <p className="text-base font-semibold text-gray-900">
                            {statusFilter === 'PENDING'
                                ? 'No pending dispute requests'
                                : `No ${statusFilter.toLowerCase()} dispute requests`}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchText.trim()
                                ? 'Try a different student name or clear search.'
                                : statusFilter === 'PENDING'
                                    ? 'Everything looks good right now.'
                                    : 'Switch filters to view other dispute statuses.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item.disputeId} className="rounded-xl border border-slate-200/70 bg-white/70 p-4">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{item.studentName} ({item.rollNo})</p>
                                        <p className="text-xs text-gray-500">{item.subjectName}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Status: <span className="font-medium text-gray-700">{item.status}</span>
                                        </p>
                                        {item.reason ? <p className="text-xs text-gray-500 mt-1">Reason: {item.reason}</p> : null}
                                    </div>
                                    {item.status === 'PENDING' ? (
                                        <DisputeReviewActions disputeId={item.disputeId} />
                                    ) : null}
                                </div>

                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Clicked photo</p>
                                        <div className="relative h-100 w-full rounded-lg border border-slate-200/70 bg-slate-100 overflow-hidden flex items-center justify-center">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={resolveUrl(item.submittedImageUrl)}
                                                alt="Submitted selfie"
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Master image</p>
                                        <div className="relative h-100 w-full rounded-lg border border-slate-200/70 bg-slate-100 overflow-hidden flex items-center justify-center">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={resolveUrl(item.masterImageUrl)}
                                                alt="Master face reference"
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
