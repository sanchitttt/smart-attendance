'use client';
import React from 'react'
import { LogIn } from 'lucide-react';
import LoginForm from '../../../components/LoginForm';

function LoginPage() {

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="flex justify-center mb-6">
                    <div className="bg-indigo-600 p-4 rounded-full">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
                    Smart Attendance
                </h1>
                <p className="text-center text-gray-600 mb-8">
                    Student Portal
                </p>

                <LoginForm />
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Demo Credentials:</p>
                    <p className="text-xs text-gray-500 font-mono">alex.j@university.edu / demo123</p>
                </div>
            </div>
        </div>
    );
}


export default LoginPage;
