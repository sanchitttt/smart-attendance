// app/login/page.tsx
import type { Metadata } from "next";
import LoginForm from "@/app/components/login/LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to Smart Attendance to manage classes and run QR-based attendance sessions.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-[#fafafa] relative text-gray-900 overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Diagonal Grid with Light */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
        linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
        radial-gradient(circle 500px at 20% 80%, rgba(139,92,246,0.3), transparent),
        radial-gradient(circle 500px at 80% 20%, rgba(59,130,246,0.3), transparent)
      `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
        }}
      />

      {/* Main Content – centered and layered above grid */}
      <div className="relative w-full max-w-md z-10">
        {/* Logo & Brand */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative mb-6">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse-slow" />
            <div className="relative bg-gradient-to-br from-indigo-600 to-blue-600 p-6 rounded-2xl shadow-2xl">
              <svg
                className="w-14 h-14 text-white overflow-visible"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c0-3.866-3.134-7-7-7s-7 3.134-7 7 3.134 7 7 7 7-3.134 7-7zM12 4v7m0 0v7m0-7h7m-7 0H5"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 tracking-tight">
            Smart Attendance
          </h1>

          <p className="mt-4 text-xl text-gray-700">
            Secure classroom attendance with QR codes
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
          <div className="p-8 sm:p-10 lg:p-12">
            <LoginForm />
          </div>

          {/* Firebase badge */}
          <div className="px-8 py-5 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100 flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full bg-[#FFCA28]/10 border border-[#FFCA28]/30 text-[#F57C00] shadow-sm">
              Powered by <span className="font-semibold text-[#F57C00]">Firebase</span>
            </span>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          Only college email accounts supported • Need help? Contact IT
        </p>
      </div>
    </div>
  );
}