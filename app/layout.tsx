import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
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
          <Sidebar />
          <main className="flex-1 lg:ml-64 min-h-screen bg-background">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
