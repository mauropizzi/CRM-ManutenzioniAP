"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Menu,
  Home,
  Users,
  Wrench,
  Package,
  Truck,
  Settings,
  MapPin,
  LogIn,
  LogOut,
  Tag,
  Factory,
} from "lucide-react"
import { useAuth } from "@/context/auth-context"

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Clienti",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Ordini",
    href: "/orders",
    icon: Package,
  },
  {
    title: "Prodotti",
    href: "/products",
    icon: Tag,
  },
  {
    title: "Servizi",
    href: "/services",
    icon: Wrench,
  },
  {
    title: "Fornitori",
    href: "/suppliers",
    icon: Factory,
  },
  {
    title: "Consegne",
    href: "/deliveries",
    icon: Truck,
  },
  {
    title: "Luoghi",
    href: "/locations",
    icon: MapPin,
  },
]

function SidebarContent({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()

  const NavItems = () => (
    <div className="grid gap-1">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <span
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-secondary transition-all hover:text-primary hover:bg-accent",
              pathname === item.href
                ? "bg-primary/10 text-primary font-medium"
                : "text-secondary"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </span>
        </Link>
      ))}
    </div>
  )

  const SidebarFooter = () => {
    if (!user) {
      return (
        <div className="px-3 pt-4 space-y-3">
          <Link href="/login">
            <Button
              variant="default"
              className="w-full justify-start rounded-lg py-2.5 px-5 font-medium"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Accedi
            </Button>
          </Link>
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
        </div>
      )
    }

    return (
      <div className="px-3 pt-4 space-y-4">
        <div className="rounded-lg border border-border bg-card px-3 py-3">
          <p className="text-xs text-muted-foreground">Connesso come</p>
          <p className="truncate text-sm font-medium text-primary">{user.email}</p>
        </div>
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
        <Button
          variant="outline"
          className="w-full justify-start rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
          onClick={async () => {
            await signOut()
            router.push("/login")
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b border-border px-4 lg:h-[60px]">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Package className="h-6 w-6 text-primary" />
          <span className="text-lg">Gestionale</span>
        </Link>
      </div>
      <div className="flex-1">
        <ScrollArea className="h-full">
          <div className="px-3 py-2">
            <NavItems />
          </div>
        </ScrollArea>
      </div>
      <SidebarFooter />
    </div>
  )
}

export function AppSidebar() {
  return (
    <div className="hidden border-r border-border bg-surface md:block">
      <div className="flex h-full max-h-screen flex-col gap-2 w-64 p-4">
        <SidebarContent />
      </div>
    </div>
  )
}

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 md:hidden rounded-lg"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-0">
        <SidebarContent isMobile />
      </SheetContent>
    </Sheet>
  )
}