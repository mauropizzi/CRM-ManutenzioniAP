"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/context/auth-context";
import { AppTopnav } from "@/components/app-topnav";
import { DataLoadingWrapper } from "@/components/data-loading-wrapper";

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLogin = pathname === "/login";
  const isPublic = pathname.startsWith("/public/");
  const isPrint = pathname.includes("/print-work-report");
  const requiresAuth = !isLogin && !isPublic;

  useEffect(() => {
    if (!loading && !user && requiresAuth) {
      router.replace("/login");
    }
  }, [loading, user, requiresAuth, router]);

  // On the login page (and print pages) we render a clean layout (no topnav/sidebar)
  if (isLogin || isPrint) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  // While auth is loading, show a single full-screen loader
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

  // If we require auth and the user is missing, we are redirecting: show something instead of a blank screen
  if (requiresAuth && !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background/80">
        <div className="text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Reindirizzamento...</p>
        </div>
      </div>
    );
  }

  const content = (
    <div className="flex min-h-screen flex-col" data-dyad-component="AppShell">
      <AppTopnav />
      <main className="flex-1 overflow-auto" data-dyad-component="Main">
        <div className="p-4 sm:p-8" data-dyad-component="Content">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );

  // For authenticated pages, wait for the main datasets before rendering.
  return requiresAuth ? <DataLoadingWrapper>{content}</DataLoadingWrapper> : content;
};

export default AppShell;