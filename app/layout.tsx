import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { CalendarProvider } from "@/lib/calendar-context";
import Sidebar from "@/components/Sidebar";
import RightPanel from "@/components/RightPanel";
import MobileNav from "@/components/MobileNav";

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
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground antialiased">
        <AuthProvider>
          <CalendarProvider>
            <div className="relative min-h-screen w-full [--sidebar-width:16rem]">
              <Sidebar />
              <main className="min-h-screen bg-background ml-0 mr-0 md:ml-[var(--sidebar-width)] md:mr-[400px] transition-all duration-300 flex flex-col md:block pb-16 md:pb-0">
                <div className="flex-1 md:flex-none flex flex-col md:block">
                  {children}
                </div>
              </main>
              <MobileNav />
              <RightPanel />
            </div>
          </CalendarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
