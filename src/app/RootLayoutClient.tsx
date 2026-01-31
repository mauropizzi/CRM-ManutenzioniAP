"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "../app/globals.css"; // Adjusted path for globals.css
import { CustomerProvider } from "@/context/customer-context";
import { InterventionProvider } from "@/context/intervention-context";
import { MaterialProvider } from "@/context/material-context";
import { TechnicianProvider } from "@/context/technician-context";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body
        className={cn(
          `${geistSans.variable} ${geistMono.variable} antialiased`,
          "min-h-screen bg-background"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <CustomerProvider>
              <InterventionProvider>
                <MaterialProvider>
                  <TechnicianProvider>
                    <SidebarProvider>
                      <div className="flex min-h-screen">
                        <AppSidebar />
                        <main className="flex-1 overflow-auto">
                          <div className="flex items-center justify-between border-b p-4 lg:hidden">
                            <div className="flex items-center">
                              <SidebarTrigger />
                              <span className="ml-2 font-semibold">Menu</span>
                            </div>
                          </div>
                          <div className="p-4 sm:p-8">
                            {children}
                          </div>
                        </main>
                      </div>
                      <Toaster />
                    </SidebarProvider>
                  </TechnicianProvider>
                </MaterialProvider>
              </InterventionProvider>
            </CustomerProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}