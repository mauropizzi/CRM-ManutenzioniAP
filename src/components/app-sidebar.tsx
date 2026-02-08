"use client";

import React from "react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Home, Users, Settings, Plus, Wrench, FileText, Package, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Clienti",
    url: "/customers",
    icon: Users,
  },
  {
    title: "Aggiungi Cliente",
    url: "/customers/new",
    icon: Plus,
  },
  {
    title: "Punti di Servizio",
    url: "/service-points",
    icon: MapPin,
  },
  {
    title: "Servizi",
    url: "/services",
    icon: Wrench,
  },
  {
    title: "Fornitori",
    url: "/suppliers",
    icon: Package,
  },
  {
    title: "Preventivi",
    url: "/quotes",
    icon: FileText,
  },
];

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <h2 className="text-lg font-semibold">Gestionale</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-4">
            <div className="flex flex-col gap-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {user?.email}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={signOut}
                className="w-full"
              >
                Esci
              </Button>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <div className="flex-1">
        <header className="flex h-16 items-center gap-4 border-b px-6">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

export function AppSidebarProvider({ children }: { children: React.ReactNode }) {
  return <AppSidebar>{children}</AppSidebar>;
}