'use client';

import React,{ useState } from 'react'
import toast from 'react-hot-toast';
import API_ROUTES from '../config/api.routes';
import { Label } from '@radix-ui/react-label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';


// import { loginAction } from '../lib/actions';

function LoginForm() {
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState('');
    const router = useRouter();


    async function onSubmit(formData: FormData) {
        try {
            const data = {
                email: formData.get("email")?.toString(),
                password: formData.get("password")?.toString(),
            }

            if (!data.email || !data.password) {
                toast.error("Please fill in all fields")
                return
            }

            const res = await fetch(API_ROUTES.LOGIN,{
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: 'include'
            });


            if (!res.ok) {
                const err = await res.json()
                toast.error(err.message ?? "Login failed")
                return;
            }

            toast.success("Logged in successfully 🎉")
            router.push("/classes");
        } catch (err) {
            console.error(err)
            toast.error("Something went wrong. Try again.")
        }
        finally {
            setLoading(false);
        }
    }


    return (

        <form onSubmit={() => setLoading(true)} action={onSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="teacher@school.com"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                    }}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                    }}
                    required
                />
            </div>
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
            <p className="text-xs text-gray-500 text-center">
                Demo: kapil@school.com / password123
            </p>
            {
                loading ?
                    <Button
                        type="submit"
                        className="w-full flex items-center justify-center"
                        disabled={true}
                    >
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </Button>
                    :
                    <Button
                        type="submit"
                        className="w-full flex items-center justify-center"
                        disabled={false}
                    >
                        Login
                    </Button>
            }


        </form>
    )
}

export default LoginForm
