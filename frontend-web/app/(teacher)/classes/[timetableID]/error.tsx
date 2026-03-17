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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
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
      <div className="w-full max-w-lg">
        {/* Logo / Brand (consistent with login) */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative mb-6">
            <div className="absolute -inset-4 bg-slate-900/5 rounded-full blur-xl" />
            <div className="relative bg-red-600/10 text-red-700 p-6 rounded-2xl ring-1 ring-red-600/15 shadow-sm">
              <AlertCircle className="w-14 h-14" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900">
            Something went wrong
          </h1>

          <p className="mt-3 text-base sm:text-lg text-gray-600">
            Please try again. If it keeps happening, go back to classes.
          </p>
        </div>

        {/* Error Card */}
        <Card className="border border-slate-200/70 shadow-sm overflow-hidden bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <CardContent className="p-8 sm:p-10 text-center space-y-8">
            {/* Error Icon */}
            <div className="mx-auto w-20 h-20 rounded-2xl bg-red-600/10 ring-1 ring-red-600/15 flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>

            {/* Message */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {error.message || "An unexpected error occurred"}
              </h2>

              <p className="text-gray-600 max-w-md mx-auto">
                We&apos;re sorry for the inconvenience. Our team has been notified.
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
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-sm"
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