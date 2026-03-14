import { cookies } from 'next/headers';
import ClassesUI from '@/app/components/ClassesUI';
import { redirect } from 'next/navigation';
import API_ROUTES from '@/app/config/api.routes';
import { requireTeacherAuth } from '@/app/lib/auth';
import Logout from '@/app/components/ui/logout';
import { Card,CardContent } from '@/app/components/ui/card';
import { Calendar } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export default async function ClassesPage() {

    const token = await requireTeacherAuth();

    const res = await fetch(API_ROUTES.MY_CLASSES,{
        headers: {
            Cookie: `access_token=${token}`,
        }
    });

    const data = await res.json();

    const classes = data?.data?.classes ?? [];
    const today = new Date();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
                        <p className="text-gray-600 mt-1">Welcome, {classes.length ? classes[0].teacherName : ""}</p>
                    </div>
                    <Logout />
                </div>

                {/* Date */}
                <Card className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                    <CardContent className="pt-6 flex items-center gap-3">
                        <Calendar className="h-8 w-8" />
                        <div>
                            <p className="text-sm text-white/80">Today's Schedule</p>
                            <p className="text-xl font-semibold">{today.toLocaleDateString("en-IN",{
                                weekday: "long",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            })}</p>
                        </div>
                    </CardContent>
                </Card>
                <ClassesUI
                    classes={classes}
                />
            </div>
        </div>
    );
}
