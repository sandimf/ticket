import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";
import { Navbar02 } from "@/components/navbar/Navbar";
import { AppSessionProvider } from "@/components/providers/session-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Loket App",
  description: "Ticketing platform built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AppSessionProvider>
          <QueryProvider>
            <Navbar02 />
            <main>{children}</main>
            <Toaster position="top-center" richColors />
          </QueryProvider>
        </AppSessionProvider>
      </body>
    </html>
  );
}