import { Loader2 } from "lucide-react";

export default function DisputesLoading() {
    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center px-4">
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 px-8 py-7 shadow-sm text-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
                <p className="mt-3 text-sm font-medium text-slate-700">Loading dispute requests...</p>
            </div>
        </div>
    );
}
