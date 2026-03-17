'use client';

import { motion } from 'framer-motion';
import { AlertCircle,Home,RefreshCw } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card,CardContent } from '@/app/components/ui/card';
import { useRouter } from 'next/navigation';

export default function SessionClosed() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
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
            <motion.div
                initial={{ opacity: 0,y: 30 }}
                animate={{ opacity: 1,y: 0 }}
                transition={{ duration: 0.6,ease: 'easeOut' }}
                className="relative z-10 w-full max-w-md"
            >
                <Card className="shadow-sm border border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 overflow-hidden">
                    <CardContent className="p-10 text-center space-y-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2,type: 'spring',stiffness: 200 }}
                            className="mx-auto w-24 h-24 rounded-2xl bg-amber-500/10 ring-1 ring-amber-600/15 flex items-center justify-center"
                        >
                            <AlertCircle className="h-14 w-14 text-amber-600" />
                        </motion.div>

                        <div className="space-y-3">
                            <h2 className="text-3xl font-bold text-gray-900">
                                Session Closed
                            </h2>
                            <p className="text-lg text-gray-600">
                                This attendance session has ended. No more check-ins allowed.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                            <Button
                                size="lg"
                                className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                                onClick={() => router.push('/classes')}
                            >
                                <Home className="h-5 w-5" />
                                Go to My Classes
                            </Button>

                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => window.location.reload()}
                            >
                                <RefreshCw className="h-5 w-5 mr-2" />
                                Refresh Page
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}