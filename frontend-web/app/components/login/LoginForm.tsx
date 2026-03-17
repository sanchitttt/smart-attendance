// components/LoginForm.tsx
'use client';

import React,{ useEffect,useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Loader2,AlertCircle } from 'lucide-react';
import { onAuthStateChanged,signInWithPopup,signOut } from 'firebase/auth';
import { auth,googleProvider } from '../../lib/firebase';
import GoogleSignInButton from './GoogleSignInBtn';
import API_ROUTES from '../../config/api.routes';

export default function LoginForm() {
    const [googleLoading,setGoogleLoading] = useState(false);
    const [checkingAuth,setCheckingAuth] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const user = auth.currentUser;

        if (user) {
            router.replace('/classes');
        } else {
            setCheckingAuth(false);
        }
    },[]);

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);

        try {
            const result = await signInWithPopup(auth,googleProvider);
            const idToken = await result.user.getIdToken();
            console.log(API_ROUTES.LOGIN,{ idToken });
            const res = await fetch(API_ROUTES.LOGIN,{
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });

            console.log(res.headers);
            if (!res.ok) {
                console.log('Called!');
                const data = await res.json();
                toast.error(data.message || 'Login failed',{ icon: <AlertCircle /> });
                await signOut(auth);
                return;
            }
            else {
                console.log(res.headers);
                const data = await res.json();
                toast.success('Signed in successfully!',{ icon: '🎉' });
                router.push('/classes');
            }

        } catch (err: any) {
            toast.error(err.message || 'Google sign-in failed',{ icon: <AlertCircle /> });
        } finally {
            setGoogleLoading(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="relative">
                    <Loader2 className="h-14 w-14 animate-spin text-indigo-600" />
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                </div>
                <p className="text-gray-600 font-medium text-lg">Verifying your session...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">Sign In</h2>
                <p className="mt-2 text-gray-600 text-[14.5px]">
                    Use your college Google account to continue
                </p>
            </div>

            <GoogleSignInButton
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                text={googleLoading ? 'Signing in...' : 'Continue with Google'}
            />

            {/* <div className="text-center text-sm text-gray-500">
                Only college email addresses are supported
            </div> */}
        </div>
    );
}