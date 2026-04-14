'use client';

import { AlertCircle,RefreshCw } from "lucide-react";
import { Button } from "@/app/components/ui/button";

type Props = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function DisputesError({ reset }: Props) {
    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center px-4">
            <div className="max-w-md rounded-2xl border border-slate-200/70 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/60 px-8 py-7 shadow-sm text-center">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6" />
                </div>
                <p className="mt-3 text-lg font-semibold text-slate-900">Could not load disputes</p>
                <p className="mt-1 text-sm text-slate-600">Please try again. If the issue continues, check backend availability.</p>
                <Button onClick={reset} className="mt-5 bg-indigo-600 hover:bg-indigo-700">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                </Button>
            </div>
        </div>
    );
}
