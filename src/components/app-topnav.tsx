"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, Home, Users, Wrench, Package, Truck, Settings, MapPin, Tag, Factory, LogOut, LogIn } from "lucide-react";
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
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  return (
    <header className="w-full border-b bg-card/60 shadow-sm sticky top-0 z-40">
      <div className="container-custom flex h-12 sm:h-14 items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="no-underline">
            <div className="text-sm sm:text-lg font-semibold rounded-md px-2 sm:px-3 py-1 bg-primary/10 text-primary">Gestione</div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-2 md:flex">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} className="no-underline">
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn("rounded-lg px-3 py-1 flex items-center gap-2", isActive && "bg-primary/10 text-primary")}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {user ? (
            <Button
              variant="ghost"
              className="hidden md:flex"
              onClick={async () => {
                await signOut();
                router.push('/login');
              }}
            >
              <LogOut className="mr-2 h-4 w-4 text-red-600" />
              Logout
            </Button>
          ) : (
            <Link href="/login" className="hidden md:block">
              <Button variant="secondary" size="sm" className="rounded-lg">
                <LogIn className="mr-2 h-4 w-4" />
                Accedi
              </Button>
            </Link>
          )}

          {/* Mobile menu trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <div className="flex h-full w-full flex-col">
                <div className="px-4 py-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold">Gestione</div>
                      <p className="text-xs text-muted-foreground">Clienti • Interventi • Impianti</p>
                    </div>
                    <div>
                      <ThemeToggle />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link key={item.name} href={item.href} className="block">
                          <Button variant="ghost" className="w-full justify-start rounded-md">
                            <Icon className="mr-2 h-4 w-4" />
                            {item.name}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-auto border-t px-4 py-3">
                  {user ? (
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600"
                      onClick={async () => {
                        await signOut();
                        router.push('/login');
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  ) : (
                    <Link href="/login" className="block">
                      <Button variant="secondary" className="w-full">
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