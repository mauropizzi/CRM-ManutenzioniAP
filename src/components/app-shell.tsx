"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/context/auth-context";
import { AppSidebar } from "@/components/app-sidebar";

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useAuth();
  const pathname = usePathname();

  // On the login page we render a clean layout (no sidebar)
  if (pathname === "/login") {
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
        <AppSidebar />
        <main className="flex-1 overflow-auto" data-dyad-component="Main">
          <div className="flex items-center justify-between border-b p-4 lg:hidden">
            <div className="flex items-center">
              <SidebarTrigger />
              <span className="ml-2 font-semibold">Menu</span>
            </div>
          </div>
          <div className="p-4 sm:p-8" data-dyad-component="Content">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  );
};

export default AppShell;