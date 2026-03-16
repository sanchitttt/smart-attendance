import { cookies } from 'next/headers';
import ClassesUI from '@/app/components/ClassesUI';
import { redirect } from 'next/navigation';
import API_ROUTES from '@/app/config/api.routes';
import { requireTeacherAuth } from '@/app/lib/auth';
import Logout from '@/app/components/ui/logout';
import { Card,CardContent } from '@/app/components/ui/card';
import { Calendar } from 'lucide-react';
import { LogoutButton } from '@/app/components/LogoutBtn';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export default async function ClassesPage() {
    const cookieStore = await cookies();
    console.log('Cookies in Server Component:',cookieStore.getAll().map(c => c.name));

    const accessToken = cookieStore.get('access_token')?.value;
    console.log('access_token in SC:',accessToken ? 'present' : 'missing');
    console.log(accessToken);

    const res = await fetch("https://192.168.0.102:8082/api/v1/timetable/class/all",{
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: accessToken ? `Bearer ${accessToken}` : '',
        },
        cache: 'no-store',
    });

    console.log('Backend response status:',res.status);
    console.log('Backend response ok:',res.ok);

    const data = await res.json();

    const classes = data?.data?.classes ?? [];
    const today = new Date();

    return (
        <div className="min-h-screen w-full bg-white relative text-gray-800">
            {/* Circuit Board - Light Pattern */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
        linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),
        linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)
      `,
                    backgroundSize: "40px 40px",
                    WebkitMaskImage:
                        "radial-gradient(ellipse 100% 80% at 50% 100%, #000 50%, transparent 90%)",
                    maskImage:
                        "radial-gradient(ellipse 100% 80% at 50% 100%, #000 50%, transparent 90%)",
                }}
            />

            {/* Your original content – wrapped in z-10 so it sits above the grid */}
            <div className="relative z-10 max-w-6xl mx-auto space-y-6 p-4">
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
                            <p className="text-xl font-semibold">
                                {today.toLocaleDateString("en-IN",{
                                    weekday: "long",
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <ClassesUI classes={classes} token={accessToken} />
            </div>
        </div>
    );
}