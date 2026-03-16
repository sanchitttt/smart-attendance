'use client';

import { QrCode,RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect,useRef,useState } from 'react';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import API_ROUTES from '../config/api.routes';

const REFRESH_INTERVAL = 4; // seconds
const MAX_REFRESHES = 8;
const TOTAL_TIME = REFRESH_INTERVAL * MAX_REFRESHES; // 32 seconds

function GenerateQR({ sessionId: sessionIdParam,token }: { sessionId: string,token: string | undefined }) {
    const [sessionId,setSessionId] = useState<string>(sessionIdParam);
    const [timeLeft,setTimeLeft] = useState<number>(TOTAL_TIME);
    const [qrValue,setQrValue] = useState<string>('');
    const [isRunning,setIsRunning] = useState<boolean>(false);
    const [error,setError] = useState<string | null>(null);

    const countdownRef = useRef<NodeJS.Timeout | null>(null);
    const refreshRef = useRef<NodeJS.Timeout | null>(null);

    // Start Attendance (create session)
    const startSession = async () => {
        try {
            setError(null);
            const res = await fetch(`https://192.168.0.102:8082/api/v1/sessions/${sessionId}/start`,{
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token ?? '',
                },
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to start session');
            }

            const json = await res.json();
            const newSessionId = json.data.sessionId;

            setSessionId(newSessionId);
            setTimeLeft(TOTAL_TIME);
            setQrValue('');
            setIsRunning(true);

            // Immediately fetch first QR
            await fetchQr(newSessionId);
        } catch (err: any) {
            setError(err.message || 'Error starting session');
            console.error(err);
        }
    };

    // Fetch QR from backend
    const fetchQr = async (sid: string) => {
        try {
            const res = await fetch(`https://192.168.0.102:8082/api/v1/sessions/${sid}/generate-qr`,{
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token ?? ''
                },
            });

            if (!res.ok) {
                throw new Error('Failed to generate QR');
            }

            const json = await res.json();
            setQrValue(JSON.stringify(json)); // encode full payload
        } catch (err: any) {
            setError('Failed to fetch QR: ' + err.message);
            console.error(err);
        }
    };

    // Countdown timer
    useEffect(() => {
        if (!isRunning) return;

        countdownRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownRef.current!);
                    setIsRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        },1000);

        return () => {
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    },[isRunning]);

    // Separate QR refresh interval (every 4 seconds)
    useEffect(() => {
        if (!isRunning || !sessionId) return;

        // Refresh immediately on start (already done in startSession)
        // Then every REFRESH_INTERVAL seconds
        refreshRef.current = setInterval(() => {
            fetchQr(sessionId);
        },REFRESH_INTERVAL * 1000);

        return () => {
            if (refreshRef.current) clearInterval(refreshRef.current);
        };
    },[isRunning,sessionId]);

    const progressPercentage = (timeLeft / TOTAL_TIME) * 100;

    // Idle state
    if (!isRunning) {
        return (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
                <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center">
                    <QrCode className="h-12 w-12 text-indigo-600" />
                </div>

                {error && <p className="text-red-600 text-center">{error}</p>}

                <p className="text-gray-600 text-center text-lg">
                    Click below to generate a new QR code for attendance
                </p>

                <Button onClick={startSession} size="lg" className="px-8 py-6 text-lg">
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Generate QR Code
                </Button>
            </div>
        );
    }

    // Active QR display
    return (
        <div className="flex flex-col items-center space-y-6">
            {error && <p className="text-red-600">{error}</p>}

            <div className="bg-white p-8 rounded-xl shadow-lg">
                {qrValue ? (
                    <QRCodeSVG value={qrValue} size={320} level="H" />
                ) : (
                    <div className="h-80 w-80 flex items-center justify-center bg-gray-100 rounded">
                        Loading QR...
                    </div>
                )}
            </div>

            <div className="w-full space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-gray-700">Time Remaining</span>
                    <Badge variant={timeLeft > 10 ? 'default' : 'destructive'} className="text-lg px-4 py-1">
                        {timeLeft}s
                    </Badge>
                </div>

                <Progress value={progressPercentage} className="h-3" />
            </div>
        </div>
    );
}

export default GenerateQR;