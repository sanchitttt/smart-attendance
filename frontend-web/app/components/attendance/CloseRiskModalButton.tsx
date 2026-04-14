'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';

export default function CloseRiskModalButton() {
    const router = useRouter();

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="h-8 text-xs font-medium border-slate-200 hover:bg-slate-50"
        >
            Close
        </Button>
    );
}
