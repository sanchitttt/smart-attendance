// app/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, QrCode, Users, Calendar, ShieldCheck, Clock, BarChart3 } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';

export const metadata: Metadata = {
  title: "Home",
  description:
    "Modern, secure, and effortless attendance tracking for schools and colleges using QR codes, real-time reports, and device binding.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2.5 rounded-lg shadow-md">
              <QrCode className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
              Smart Attendance
            </span>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-700">
              <Link href="#features" className="hover:text-indigo-600 transition-colors">Features</Link>
              <Link href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</Link>
              <Link href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</Link>
            </nav>

            <div className="flex gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-20 pb-32 md:pt-32 md:pb-48 px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center space-y-10">
          <Badge variant="secondary" className="text-sm px-4 py-1.5">
            Now used in 500+ classrooms
          </Badge>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600">
            Attendance Made Effortless
          </h1>

          <p className="text-xl sm:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            QR codes, real-time tracking, device binding, and powerful admin dashboard — all in one simple platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6">
            <Button size="lg" className="h-14 px-10 text-lg gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200/50">
              Start Free Trial <ArrowRight className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg">
              Watch Demo
            </Button>
          </div>

          {/* Trust signals */}
          <div className="pt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" /> 30-second setup
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" /> 99.9% uptime
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" /> GDPR compliant
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Everything you need for perfect attendance
            </h2>
            <p className="mt-5 text-xl text-gray-600 max-w-3xl mx-auto">
              Designed for teachers, trusted by institutions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: QrCode,
                title: "Instant QR Generation",
                description: "One-click QR codes for each class session. Students scan in seconds.",
                color: "indigo",
              },
              {
                icon: ShieldCheck,
                title: "Device Binding",
                description: "Prevent proxy attendance with hardware-bound sessions.",
                color: "blue",
              },
              {
                icon: Clock,
                title: "Real-time Tracking",
                description: "Live attendance dashboard updates instantly as students arrive.",
                color: "purple",
              },
              {
                icon: BarChart3,
                title: "Powerful Reports",
                description: "Monthly, weekly, and custom reports with export options.",
                color: "emerald",
              },
              {
                icon: Users,
                title: "Multi-user Roles",
                description: "Admin, teacher, and student portals with role-based access.",
                color: "amber",
              },
              {
                icon: Calendar,
                title: "Timetable Integration",
                description: "Syncs with your existing timetable for automatic session creation.",
                color: "rose",
              },
            ].map((feature, i) => (
              <Card key={i} className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 text-center space-y-5">
                  <div className={`mx-auto w-16 h-16 rounded-xl bg-${feature.color}-100 flex items-center justify-center`}>
                    <feature.icon className={`h-8 w-8 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-blue-700 text-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-bold">
            Ready to modernize your attendance?
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Get started in minutes. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6">
            <Button size="lg" className="h-14 px-10 text-lg bg-white text-indigo-700 hover:bg-gray-100">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-white text-white hover:bg-white/10">
              Watch Demo Video
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-white text-xl font-bold mb-6">Smart Attendance</h3>
            <p className="text-gray-400">
              Secure QR-based attendance system built for modern classrooms.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Smart Attendance. All rights reserved.
        </div>
      </footer>
    </div>
  );
}