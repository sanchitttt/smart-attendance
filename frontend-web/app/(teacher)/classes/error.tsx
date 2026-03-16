'use client';

import Logout from "@/app/components/ui/logout";
import { AlertCircle,RefreshCw,Home } from 'lucide-react';
import { Button } from "@/app/components/ui/button";
import { Card,CardContent } from "@/app/components/ui/card";

function Error() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header with Logout */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-3 rounded-xl shadow-md">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Smart Attendance</h1>
          </div>

          <Logout />
        </div>

        {/* Main Error Card */}
        <Card className="border-none shadow-2xl overflow-hidden bg-white/95 backdrop-blur-sm">
          <CardContent className="p-10 sm:p-12 text-center space-y-8">
            {/* Icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>

            {/* Title & Message */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">
                Something went wrong
              </h2>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                We're sorry, an unexpected error occurred. Please try again or contact support if the problem persists.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>

              <Button
                variant="default"
                size="lg"
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                onClick={() => window.location.href = '/'}
              >
                <Home className="h-4 w-4" />
                Go to Home
              </Button>
            </div>

            {/* Support info */}
            <p className="text-sm text-gray-500 pt-4">
              Error ID: {Math.random().toString(36).substring(2,10).toUpperCase()} • Contact support if needed
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Error;