import React from 'react'
import { LogIn } from 'lucide-react';
import LoginForm from '@/app/components/LoginForm';
import { Card,CardContent,CardDescription,CardHeader,CardTitle } from '@/app/components/ui/card';

function TeacherLogin() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center">
                            <LogIn className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center">Teacher Login</CardTitle>
                    <CardDescription className="text-center">
                        Enter your credentials to access the attendance system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm />
                </CardContent>
            </Card>
        </div>
    );
}

export default TeacherLogin;
