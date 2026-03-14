'use client';

import { QrCode, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import API_ROUTES from '../config/api.routes';

const REFRESH_INTERVAL = 4; // seconds
const MAX_REFRESHES = 8;
const TOTAL_TIME = REFRESH_INTERVAL * MAX_REFRESHES; // 32 seconds

function GenerateQR({ timetableEntryID }: { timetableEntryID: string | number }) {
    const [sessionId, setSessionId] = useState<string>('');
    const [timeLeft, setTimeLeft] = useState<number>(TOTAL_TIME);
    const [qrValue, setQrValue] = useState<string>('');
    const [isRunning, setIsRunning] = useState<boolean>(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const lastCycleRef = useRef<number>(-1);

    // 🟢 Start Attendance (create session)
    const startSession = async () => {
        const res = await fetch(API_ROUTES.START_SESSION, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timetableEntryId: timetableEntryID }),
        });

        const json = await res.json();

        // 🔥 HARD RESET
        setSessionId(json.data.sessionId);
        setTimeLeft(TOTAL_TIME);
        setQrValue('');
        setIsRunning(true);
        lastCycleRef.current = -1;
    };

    // 🔁 Fetch QR from backend
    const fetchQr = async (sid: string) => {
        const res = await fetch(
            API_ROUTES.GENERATE_QR(sid),
            { credentials: 'include' }
        );

        const json = await res.json();
        setQrValue(JSON.stringify(json)); // encode full payload
    };

    // ⏱ Global countdown timer (runs once)
    useEffect(() => {
        if (!isRunning) return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    timerRef.current = null;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isRunning]);

    // 🔁 QR refresh every 4 seconds (derived from timeLeft)
    useEffect(() => {
        if (!isRunning || !sessionId) return;

        const elapsed = TOTAL_TIME - timeLeft;
        const currentCycle = Math.floor(elapsed / REFRESH_INTERVAL);

        if (
            currentCycle !== lastCycleRef.current &&
            currentCycle < MAX_REFRESHES
        ) {
            lastCycleRef.current = currentCycle;
            fetchQr(sessionId);
        }

        if (timeLeft === 0) {
            setIsRunning(false);
        }
    }, [timeLeft, isRunning, sessionId]);

    const progressPercentage = (timeLeft / TOTAL_TIME) * 100;

    // 🧊 Idle state
    if (!isRunning) {
        return (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
                <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center">
                    <QrCode className="h-12 w-12 text-indigo-600" />
                </div>

                <p className="text-gray-600 text-center text-lg">
                    Click the button below to generate a new QR code
                </p>

                <Button
                    onClick={startSession}
                    size="lg"
                    className="px-8 py-6 text-lg"
                >
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Generate QR Code
                </Button>
            </div>
        );
    }

    // 🔥 Active QR display
    return (
        <div className="flex flex-col items-center space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <QRCodeSVG
                    value={qrValue}
                    size={320}
                    level="H"
                />
            </div>

            <div className="w-full space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-gray-700">
                        Time Remaining
                    </span>
                    <Badge
                        variant={timeLeft > 10 ? 'default' : 'destructive'}
                        className="text-lg px-4 py-1"
                    >
                        {timeLeft}s
                    </Badge>
                </div>

                <Progress value={progressPercentage} className="h-3" />
            </div>
        </div>
    );
}

export default GenerateQR;
