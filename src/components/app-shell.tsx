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
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-base text-text-secondary font-medium">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background" data-dyad-component="AppShell">
        <AppSidebar />
        <main className="flex-1 overflow-auto" data-dyad-component="Main">
          <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-10 w-10" />
              <span className="text-lg font-semibold text-foreground">Menu</span>
            </div>
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
          </div>
          <div className="container-base py-6" data-dyad-component="Content">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  );
};

export default AppShell;