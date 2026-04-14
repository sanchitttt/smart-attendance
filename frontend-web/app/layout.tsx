import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300","400","500","600","700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Smart Attendance",
    template: "%s | Smart Attendance", // for child pages: "My Classes | Smart Attendance"
  },
  description: "Secure, real-time attendance tracking using QR codes for schools and colleges.",

  openGraph: {
    title: "Smart Attendance",
    description:
      "Secure, real-time attendance tracking using QR codes for schools and colleges.",
    siteName: "Smart Attendance",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Smart Attendance",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Smart Attendance",
    description:
      "Secure, real-time attendance tracking using QR codes for schools and colleges.",
    images: ["/og-image.svg"],
  },

  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        {children}
        <Toaster />
        {/* <footer className="fixed bottom-0 left-0 w-full py-4 text-center text-gray-400 bg-transparent">
          <p>
            Made with ❤️ by{' '}
            <a
              href="https://sanchittewari.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Sanchit
            </a>
          </p>
        </footer> */}
      </body>
    </html>
  );
}
