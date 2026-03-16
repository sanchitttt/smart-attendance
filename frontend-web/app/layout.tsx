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
  
  // Open Graph / Facebook, LinkedIn, WhatsApp etc.
  openGraph: {
    title: "Smart Attendance",
    description: "QR-based attendance system for educational institutions",
    url: "https://your-domain.com",
    siteName: "Smart Attendance",
    images: [
      {
        url: "/og-image.jpg",           // ← add a 1200×630 image in /public
        width: 1200,
        height: 630,
        alt: "Smart Attendance Dashboard",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  // Twitter / X cards
  twitter: {
    card: "summary_large_image",
    title: "Smart Attendance",
    description: "Modern attendance solution for classrooms",
    images: ["/og-image.jpg"],
  },

  // Icons (recommended)
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },

  // Optional extras
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
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
      </body>
    </html>
  );
}
