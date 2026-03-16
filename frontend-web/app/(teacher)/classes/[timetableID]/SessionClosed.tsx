'use client';

import { motion } from 'framer-motion';
import { AlertCircle,Home,RefreshCw } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card,CardContent } from '@/app/components/ui/card';
import { useRouter } from 'next/navigation';

export default function SessionClosed() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0,y: 30 }}
                animate={{ opacity: 1,y: 0 }}
                transition={{ duration: 0.6,ease: 'easeOut' }}
                className="w-full max-w-md"
            >
                <Card className="shadow-2xl border-none overflow-hidden">
                    <CardContent className="p-10 text-center space-y-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2,type: 'spring',stiffness: 200 }}
                            className="mx-auto w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center"
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
                                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
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