"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Menu,
  Home,
  Users,
  Wrench,
  Package,
  Truck,
  Settings,
  MapPin,
  Tag,
  Factory,
  LogOut,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Interventi", href: "/interventions", icon: Wrench },
  { name: "Clienti", href: "/customers", icon: Users },
  { name: "Punti Servizio", href: "/service-points", icon: MapPin },
  { name: "Tipo Impianto", href: "/system-types", icon: Tag },
  { name: "Marche", href: "/brands", icon: Factory },
  { name: "Materiali", href: "/materials", icon: Package },
  { name: "Tecnici", href: "/technicians", icon: Truck },
  { name: "Fornitori", href: "/suppliers", icon: Settings },
];

export function AppTopnav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wrench className="h-4 w-4 text-primary" />
            </div>
          </div>

          {/* Desktop nav (pill bar stile Materiali) */}
          <nav className="hidden md:block">
            <div className="rounded-2xl border bg-card/60 p-1 shadow-sm">
              <div className="flex items-center gap-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link key={item.name} href={item.href} className="no-underline">
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                          "h-9 rounded-xl px-3 text-sm",
                          isActive
                            ? "bg-primary/10 text-primary hover:bg-primary/15"
                            : "text-foreground/80 hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        <Icon className={cn("mr-2 h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                        <span className="hidden lg:inline">{item.name}</span>
                        <span className="lg:hidden">{item.name.slice(0, 1)}</span>
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {user ? (
            <Button
              variant="ghost"
              className="hidden md:flex rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
              onClick={async () => {
                await signOut();
                router.push("/login");
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          ) : (
            <Link href="/login" className="hidden md:block">
              <Button variant="secondary" size="sm" className="rounded-xl bg-primary/10 text-primary hover:bg-primary/15">
                <LogIn className="mr-2 h-4 w-4" />
                Accedi
              </Button>
            </Link>
          )}

          {/* Mobile menu trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden rounded-xl">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <div className="flex h-full w-full flex-col">
                <div className="px-4 py-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Wrench className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <ThemeToggle />
                  </div>

                  <div className="space-y-2">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link key={item.name} href={item.href} className="block">
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className={cn(
                              "w-full justify-start rounded-xl",
                              isActive && "bg-primary/10 text-primary hover:bg-primary/15"
                            )}
                          >
                            <Icon className={cn("mr-2 h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                            {item.name}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-auto border-t bg-background/80 px-4 py-3">
                  {user ? (
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
                      onClick={async () => {
                        await signOut();
                        router.push("/login");
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  ) : (
                    <Link href="/login" className="block">
                      <Button variant="secondary" className="w-full rounded-xl bg-primary/10 text-primary hover:bg-primary/15">
                        <LogIn className="mr-2 h-4 w-4" />
                        Accedi
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default AppTopnav;