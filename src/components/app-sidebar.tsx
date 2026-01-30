"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Wrench, ClipboardList, LogOut, User, Package, HardHat } from "lucide-react"

import {
  Sidebar,
  SidebarBody,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/sidebar"
import { useSidebar } from "@/context/sidebar-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "./ui/button"

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Interventi",
    url: "/interventions",
    icon: Wrench,
  },
  {
    title: "Anagrafica Clienti",
    url: "/customers",
    icon: Users,
  },
  {
    title: "Anagrafica Materiali",
    url: "/materials",
    icon: Package,
  },
  {
    title: "Anagrafica Tecnici", // Assicurati che questo sia presente
    url: "/technicians",
    icon: HardHat,
  },
]

export function AppSidebar() {
  const { isSidebarOpen, closeSidebar } = useSidebar()
  const pathname = usePathname()
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    closeSidebar(); // Chiudi la sidebar dopo il logout
  };

  return (
    <Sidebar open={isSidebarOpen} onOpenChange={closeSidebar}>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ClipboardList className="h-6 w-6" />
          <span>Gestione Interventi</span>
        </Link>
      </SidebarHeader>
      <SidebarBody>
        <SidebarGroup title="Navigazione">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.url} isActive={pathname === item.url}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link href={item.url} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarGroup>

        <SidebarGroup title="Azioni Rapide">
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Nuovo Intervento">
              <Link href="/interventions/new" className="flex items-center gap-3">
                <Wrench className="h-4 w-4" />
                <span>Nuovo Intervento</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Nuovo Cliente">
              <Link href="/customers/new" className="flex items-center gap-3">
                <Users className="h-4 w-4" />
                <span>Nuovo Cliente</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Nuovo Materiale">
              <Link href="/materials/new" className="flex items-center gap-3">
                <Package className="h-4 w-4" />
                <span>Nuovo Materiale</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Nuovo Tecnico">
              <Link href="/technicians/new" className="flex items-center gap-3">
                <HardHat className="h-4 w-4" />
                <span>Nuovo Tecnico</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarGroup>

        <SidebarGroup title="Account">
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Profilo">
              <Link href="/profile" className="flex items-center gap-3">
                <User className="h-4 w-4" />
                <span>Profilo</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip="Esci">
              <div className="flex items-center gap-3">
                <LogOut className="h-4 w-4" />
                <span>Esci</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarGroup>
      </SidebarBody>
    </Sidebar>
  )
}