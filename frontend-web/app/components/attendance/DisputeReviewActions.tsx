'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/app/components/ui/button';
import API_ROUTES from '@/app/config/api.routes';

type Props = {
    disputeId: number;
};

export default function DisputeReviewActions({ disputeId }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const reviewDispute = async (decision: 'APPROVE' | 'DENY') => {
        setLoading(true);
        try {
            const res = await fetch(API_ROUTES.REVIEW_DISPUTE(disputeId), {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ decision }),
            });

            if (!res.ok) {
                throw new Error('Failed');
            }

            toast.success(`Dispute ${decision === 'APPROVE' ? 'approved' : 'rejected'}`);
            router.refresh();
        } catch {
            toast.error('Unable to review dispute');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={loading}
                onClick={() => reviewDispute('APPROVE')}
            >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Approve
            </Button>
            <Button
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={() => reviewDispute('DENY')}
            >
                <XCircle className="h-4 w-4 mr-1" />
                Deny
            </Button>
        </div>
    );
}
