import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { CalendarProvider } from "@/lib/calendar-context";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Better Calendar",
  description: "AI-powered calendar application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex">
        <AuthProvider>
          <CalendarProvider>
            <Sidebar />
            <main className="flex-1 lg:ml-64 min-h-screen bg-background pt-[64px] lg:pt-0">
              {children}
            </main>
          </CalendarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
