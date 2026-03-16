'use client';

import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50/30 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg">
        {/* Logo / Brand (consistent with login) */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative mb-6">
            <div className="absolute -inset-4 bg-gradient-to-r from-red-400/20 to-orange-400/20 rounded-full blur-xl animate-pulse-slow" />
            <div className="relative bg-gradient-to-br from-red-600 to-orange-600 p-6 rounded-2xl shadow-2xl">
              <AlertCircle className="w-14 h-14 text-white" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-700 to-orange-700 tracking-tight">
            Oops!
          </h1>

          <p className="mt-4 text-xl text-gray-700">
            Something went wrong
          </p>
        </div>

        {/* Error Card */}
        <Card className="border-none shadow-2xl overflow-hidden bg-white/95 backdrop-blur-md">
          <CardContent className="p-8 sm:p-10 text-center space-y-8">
            {/* Error Icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center animate-pulse-slow">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>

            {/* Message */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {error.message || "An unexpected error occurred"}
              </h2>

              <p className="text-gray-600 max-w-md mx-auto">
                We're sorry for the inconvenience. Our team has been notified.
              </p>

              {process.env.NODE_ENV === 'development' && (
                <p className="text-sm text-red-600 font-mono bg-red-50 p-3 rounded-lg border border-red-200">
                  {error.stack?.split('\n').slice(0, 3).join('\n')}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                onClick={() => reset()}
                size="lg"
                className="gap-2 bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="h-5 w-5" />
                Try Again
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => (window.location.href = '/')}
              >
                <Home className="h-5 w-5" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support footer */}
        <p className="mt-8 text-center text-sm text-gray-500">
          If the problem persists, contact support at{' '}
          <a href="mailto:support@yourcollege.edu" className="text-indigo-600 hover:underline">
            sanchittewari222@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}