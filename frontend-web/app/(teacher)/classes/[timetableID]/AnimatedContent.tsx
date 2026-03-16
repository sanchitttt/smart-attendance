// app/[timetableID]/AnimatedContent.tsx
'use client';

import { motion,AnimatePresence } from 'framer-motion';
import { Card,CardContent,CardHeader,CardTitle,CardDescription } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { ArrowLeft,BookOpen,CheckCircle2,Clock,LogOut,QrCode,RefreshCw,Users } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import GenerateQR from '@/app/components/GenerateQR';
import BackButton from '@/app/components/ui/back-button';
import Logout from '@/app/components/ui/logout';

interface Cls {
  timetableID: number;
  subjectName: string;
  programName: string;
  semester: number;
  adminName: string;
  status: "old" | "active" | "upcoming";
  startTime: string;
  endTime: string;
  startYear: string;
  endYear: string;
}

function formatTimeRange(startTime: string,endTime: string): string {
  // const format = (time: string) => {
  //   const [h,m] = time.split(":");
  //   return `${h.padStart(2,"0")}:${m.padStart(2,"0")}`;
  // };
  // return `${format(startTime)} - ${format(endTime)}`;
  return '';
}

type AnimatedContentProps = {
  cls: Cls;
  students: any[]; // replace with real type
  isActive: boolean;
  timeLeft: number;
  progressPercentage: number;
  sessionId: string;
  timetableID: string;
  token: string;
};

export default function AnimatedContent({
  cls,
  students,
  isActive,
  timeLeft,
  progressPercentage,
  sessionId,
  timetableID,
  token,
}: AnimatedContentProps) {
  console.log(cls.startTime,cls.endTime);
  const timeRange = formatTimeRange(cls.startTime,cls.endTime);
  return (
    <motion.div
      initial={{ opacity: 0,y: 20 }}
      animate={{ opacity: 1,y: 0 }}
      transition={{ duration: 0.6,ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Class Information Card */}
      <motion.div
        initial={{ opacity: 0,scale: 0.98 }}
        animate={{ opacity: 1,scale: 1 }}
        transition={{ delay: 0.1,duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xl">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { icon: BookOpen,label: "Subject",value: cls.subjectName },
                { icon: Users,label: "Program",value: cls.programName },
                { icon: Clock,label: "Time",value: formatTimeRange(cls.startTime,cls.endTime) },
                { icon: Users,label: "Batch",value: `${cls.startYear}-${cls.endYear}` },
                { icon: BookOpen,label: "Semester",value: cls.semester },
              ].map((item,i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0,y: 10 }}
                  animate={{ opacity: 1,y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-white/80">{item.label}</p>
                    <p className="font-semibold text-lg">{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">

        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0,x: -20 }}
          animate={{ opacity: 1,x: 0 }}
          transition={{ delay: 0.3,duration: 0.6 }}
        >
          <Card className="h-full shadow-lg border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <QrCode className="h-5 w-5 text-indigo-600" />
                QR Code Scanner
              </CardTitle>
              <CardDescription>
                Generate a QR code for students to scan (active for 30 seconds)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <GenerateQR timetableEntryID={timetableID} token={token} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Live Attendance */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0,x: 20 }}
          animate={{ opacity: 1,x: 0 }}
          transition={{ delay: 0.4,duration: 0.6 }}
        >
          <Card className="h-full shadow-lg border-none">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-xl">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Live Attendance
                </span>
                <Badge variant="secondary" className="text-lg px-4 py-1.5">
                  {students.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                Students who have marked their attendance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <AnimatePresence mode="wait">
                  {students.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0,y: 20 }}
                      animate={{ opacity: 1,y: 0 }}
                      exit={{ opacity: 0,y: -20 }}
                      className="flex flex-col items-center justify-center py-12 text-gray-500"
                    >
                      <Users className="h-12 w-12 mb-3 opacity-40" />
                      <p className="text-lg font-medium">No students checked in yet</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      {students.map((student,index) => (
                        <motion.div
                          key={student.id || index}
                          initial={{ opacity: 0,x: -30 }}
                          animate={{ opacity: 1,x: 0 }}
                          transition={{ delay: index * 0.08,type: "spring",stiffness: 120 }}
                          className="flex items-center justify-between p-4 bg-green-50/80 border border-green-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-lg">
                              {student.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{student.name}</p>
                              <p className="text-xs text-gray-600">
                                {new Date(student.timestamp).toLocaleTimeString([],{ hour: '2-digit',minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Statistics Summary */}
      {students.length > 0 && (
        <motion.div
          initial={{ opacity: 0,y: 30 }}
          animate={{ opacity: 1,y: 0 }}
          transition={{ delay: 0.6,duration: 0.7 }}
        >
          <Card className="shadow-xl border-none">
            <CardHeader>
              <CardTitle className="text-2xl">Session Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: "Total Students",value: students.length,color: "blue" },
                  { label: "Status",value: isActive ? 'Active' : 'Ended',color: isActive ? "green" : "gray" },
                  { label: "Session ID",value: sessionId?.split('-')[1] || 'N/A',color: "purple",isMono: true },
                  {
                    label: "Attendance Rate",
                    value: `${Math.round((students.length / 105) * 100)}%`,
                    color: "orange",
                  },
                ].map((stat,i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0,scale: 0.95 }}
                    animate={{ opacity: 1,scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className={`p-6 rounded-xl bg-${stat.color}-50 border border-${stat.color}-100 shadow-sm hover:shadow-md transition-shadow`}
                  >
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold text-${stat.color}-700 ${stat.isMono ? 'font-mono tracking-tight' : ''}`}>
                      {stat.value}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}