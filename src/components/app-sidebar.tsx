"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Wrench, ClipboardList, LogOut, User, Package, HardHat } from "lucide-react" // Importa l'icona HardHat per i tecnici

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Anagrafica Clienti",
    url: "/customers",
    icon: Users,
  },
  {
    title: "Richieste Intervento",
    url: "/interventions",
    icon: ClipboardList,
  },
  {
    title: "Anagrafica Materiali",
    url: "/materials",
    icon: Package,
  },
  {
    title: "Anagrafica Tecnici", // Nuovo elemento del menu
    url: "/technicians",
    icon: HardHat, // Icona per i tecnici
  },
  {
    title: "Fornitori",
    url: "/suppliers",
    icon: Users,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <h2 className="text-lg font-bold text-sidebar-foreground">Gestione Interventi</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principale</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.url || pathname.startsWith(`${item.url}/`)}
                  tooltip={item.title}
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Azioni Rapide</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Nuovo Intervento">
                <Link href="/interventions/new" className="flex items-center gap-3">
                  <Wrench className="h-4 w-4" />
                  <span>Nuovo Intervento</span>
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
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border p-4 space-y-3">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-sidebar-foreground">Tema</span>
          <ThemeToggle />
        </div>
        
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-sidebar-foreground">
              <User className="h-4 w-4" />
              <span className="truncate">{user.email}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            asChild
          >
            <Link href="/login">
              <User className="h-4 w-4 mr-2" />
              Accedi
            </Link>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}