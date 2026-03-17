'use client';

import { Suspense,useState } from 'react';
import GenerateQR from '@/app/components/GenerateQR';
import LiveAttendance from './LiveAttendance';
import AttendanceSkeleton from './AttendanceSkeleton';

interface AttendanceWrapperProps {
    sessionId: string;
    timetableID: string;
}

export default function AttendanceWrapper({ sessionId,timetableID }: AttendanceWrapperProps) {
    const [qrStatus,setQrStatus] = useState<'idle' | 'running' | 'finished'>('idle');

    return (
        <div className="flex xs:flex-col md:flex-row gap-[1.5%]">
            {/* QR Section */}
            {qrStatus !== 'finished' && (
                <GenerateQR
                    sessionId={sessionId}
                    onStatusChange={setQrStatus} // let QR notify parent when finished
                />
            )}

            {/* Attendance List */}
            <div className={qrStatus === 'finished' ? "w-[100%]" : "xs:w-[100%] md:w-[30%]"}>
                <LiveAttendance
                    sessionId={+sessionId}
                    className="w-full"
                    active={qrStatus != 'idle'}
                />
            </div>

        </div>
    );
}