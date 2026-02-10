"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/context/auth-context";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopnav } from "@/components/app-topnav";

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useAuth();
  const pathname = usePathname();

  // On the login page (and print pages) we render a clean layout (no sidebar)
  if (pathname === "/login" || pathname.includes("/print-work-report")) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background/80">
        <div className="text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen" data-dyad-component="AppShell">
        <div className="flex-1 flex flex-col">
          <AppTopnav />
          <div className="flex flex-1 overflow-auto">
            <AppSidebar />
            <main className="flex-1 overflow-auto" data-dyad-component="Main">
              <div className="p-4 sm:p-8" data-dyad-component="Content">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
};

export default AppShell;