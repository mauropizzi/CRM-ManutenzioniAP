"use client";

import React from "react";
import dynamic from "next/dynamic";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

// Import dinamico del sidebar (named export) solo lato client
const AppSidebar = dynamic(
  () => import("@/components/app-sidebar").then((m) => m.AppSidebar),
  {
    ssr: false,
    loading: () => (
      <div className="w-64 border-r p-4 text-sm text-muted-foreground">
        Caricamento menu...
      </div>
    ),
  }
);

export const AppShell = ({ children }: { children: React.ReactNode }) => {
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
          <div className="p-4 sm:p-8" data-dyad-component="Content">{children}</div>
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  );
};

export default AppShell;