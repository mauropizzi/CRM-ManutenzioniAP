"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Users, Wrench, ClipboardList, UserCog, LogOut } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { useProfile } from "@/context/profile-context"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
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
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { canManageUsers, profile } = useProfile()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success("Logout effettuato")
      router.push('/')
    } catch (error) {
      toast.error("Errore durante il logout")
    }
  }

  // Non mostrare sidebar se non loggato (sulla pagina login)
  if (!profile) {
    return null
  }

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
          </SidebarMenu>
        </SidebarGroup>

        {canManageUsers && (
          <SidebarGroup>
            <SidebarGroupLabel>Amministrazione</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === "/users"}
                  tooltip="Gestione Utenti"
                >
                  <Link href="/users" className="flex items-center gap-3">
                    <UserCog className="h-4 w-4" />
                    <span>Gestione Utenti</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={handleLogout}
                tooltip="Logout"
              >
                <div className="flex items-center gap-3 text-red-600">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}