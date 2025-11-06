import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";
import { AppSessionProvider } from "@/components/providers/session-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

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
            <SidebarProvider>
            <AppSidebar/>
            <main>{children}</main>
            <Toaster position="top-center" richColors />
            </SidebarProvider>
          </QueryProvider>
        </AppSessionProvider>
      </body>
    </html>
  );
}