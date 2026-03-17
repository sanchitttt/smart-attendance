'use client';

import { QrCode,RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect,useRef,useState } from 'react';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import API_ROUTES from '../config/api.routes';
import { Card,CardContent,CardDescription,CardHeader,CardTitle } from './ui/card';
import { AnimatePresence,motion } from 'motion/react';

const REFRESH_INTERVAL = 4; // seconds
const MAX_REFRESHES = 8;
const TOTAL_TIME = REFRESH_INTERVAL * MAX_REFRESHES; // 32 seconds

interface GenerateQRProps {
    sessionId: string;
    onStatusChange?: (status: 'idle' | 'running' | 'finished') => void;
}

function GenerateQR({ sessionId: sessionIdParam,onStatusChange }: GenerateQRProps) {
    const [sessionId,setSessionId] = useState<string>(sessionIdParam);
    const [timeLeft,setTimeLeft] = useState<number>(TOTAL_TIME);
    const [qrValue,setQrValue] = useState<string>('');
    const [status,setStatus] = useState<'idle' | 'running' | 'finished'>('idle');
    const [error,setError] = useState<string | null>(null);

    const countdownRef = useRef<NodeJS.Timeout | null>(null);
    const refreshRef = useRef<NodeJS.Timeout | null>(null);

    // Start Attendance (create session) only when user clicks button
    const handleGenerateQR = async () => {
        try {
            setError(null);

            // If session is not running yet, start it
            if (status === 'idle') {
                const res = await fetch(API_ROUTES.SESSION_START(sessionId),{
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
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
                setStatus('running');
                if (onStatusChange)
                    onStatusChange('running');
            }

            // Fetch the QR code
            await fetchQr(sessionId);
        } catch (err: any) {
            setError(err.message || 'Error generating QR');
            console.error(err);
        }
    };

    // Fetch QR from backend
    const fetchQr = async (sid: string) => {
        try {
            const res = await fetch(API_ROUTES.GENERATE_QR(sid),{
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
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
        if (status !== 'running') return;

        countdownRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownRef.current!);
                    setStatus('finished');
                    if (onStatusChange)
                        onStatusChange('finished');
                    return 0;
                }
                return prev - 1;
            });
        },1000);

        return () => {
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    },[status]);

    // QR refresh interval (every 4 seconds)
    useEffect(() => {
        if (status !== 'running' || !sessionId) return;

        // Refresh QR every REFRESH_INTERVAL seconds
        refreshRef.current = setInterval(() => {
            fetchQr(sessionId);
        },REFRESH_INTERVAL * 1000);

        return () => {
            if (refreshRef.current) clearInterval(refreshRef.current);
        };
    },[status,sessionId]);

    const progressPercentage = (timeLeft / TOTAL_TIME) * 100;

    return (
        <AnimatePresence mode="wait">
            {status === 'running' && (
                <motion.div
                    key="qr"
                    initial={{ opacity: 0,scale: 0.9 }}
                    animate={{ opacity: 1,scale: 1 }}
                    exit={{ opacity: 0,scale: 0.8,y: -40 }}
                    transition={{ duration: 0.4 }}
                    className="sm:w-[100%] md:w-[70%]"
                >
                    <motion.div
                        key="running"
                        initial={{ opacity: 0,scale: 1.05 }}
                        animate={{ opacity: 1,scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="lg:col-span-3"
                    >
                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <QrCode className="h-5 w-5" />
                                    QR Code Scanner
                                </CardTitle>
                                <CardDescription>
                                    Generate a QR code for students to scan (Active for 30 seconds)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            )}

            {status === 'idle' && (
                <motion.div
                    key="idle"
                    initial={{ opacity: 0,scale: 1.05 }}
                    animate={{ opacity: 1,scale: 1 }}
                    exit={{ opacity: 0,scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                    className="sm:w-[100%] md:w-[70%]"
                >
                    <motion.div
                        key="idle-card"
                        initial={{ opacity: 0,scale: 1.05 }}
                        animate={{ opacity: 1,scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="lg:col-span-3"
                    >
                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <QrCode className="h-5 w-5" />
                                    QR Code Scanner
                                </CardTitle>
                                <CardDescription>
                                    Generate a QR code for students to scan (Active for 30 seconds)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col items-center justify-center py-16 space-y-6">
                                    <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <QrCode className="h-12 w-12 text-indigo-600" />
                                    </div>

                                    {error && <p className="text-red-600 text-center">{error}</p>}

                                    <p className="text-gray-600 text-center text-lg">
                                        Click below to generate a new QR code for attendance
                                    </p>

                                    <Button onClick={handleGenerateQR} size="lg" className="px-8 py-6 text-lg">
                                        <RefreshCw className="mr-2 h-5 w-5" />
                                        Generate QR Code
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default GenerateQR;