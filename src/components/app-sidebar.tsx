"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
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
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Interventi', href: '/interventions', icon: Wrench },
  { name: 'Clienti', href: '/customers', icon: Users },
  { name: 'Punti Servizio', href: '/service-points', icon: MapPin },
  { name: 'Tipo Impianto', href: '/system-types', icon: Tag },
  { name: 'Marche', href: '/brands', icon: Factory },
  { name: 'Materiali', href: '/materials', icon: Package },
  { name: 'Tecnici', href: '/technicians', icon: Truck },
  { name: 'Fornitori', href: '/suppliers', icon: Settings },
];

interface AppSidebarProps {
  className?: string;
}

function SidebarFooter() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <div className="px-3 pt-4">
        <Link href="/login" className="block">
          <Button
            variant="secondary"
            className="w-full justify-start rounded-xl bg-primary/10 text-primary hover:bg-primary/15"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Accedi
          </Button>
        </Link>
        <div className="mt-3">
          <ThemeToggle />
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 pt-4">
      <div className="mb-3 card-base px-3 py-2">
        <p className="text-xs text-muted-foreground">Connesso come</p>
        <p className="truncate text-sm font-medium">{user.email}</p>
      </div>
      <div className="mb-3 flex justify-center">
        <ThemeToggle />
      </div>
      <Button
        variant="ghost"
        className="w-full justify-start rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
        onClick={async () => {
          await signOut();
          router.push('/login');
        }}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}

export function AppSidebar({ className }: AppSidebarProps) {
  const pathname = usePathname();

  const NavItems = () => (
    <>
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.name} href={item.href}>
            <Button
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start rounded-xl',
                isActive && 'bg-primary/10 text-primary hover:bg-primary/15'
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </Button>
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn('flex w-72 flex-col border-r bg-background/80', className)}>
        <div className="space-y-4 py-5">
          <div className="px-4">
            <h2 className="text-lg font-semibold tracking-tight">Gestione</h2>
            <p className="text-xs text-muted-foreground">Clienti • Interventi • Impianti</p>
          </div>
          <div className="px-3">
            <div className="space-y-1">
              <NavItems />
            </div>
          </div>
        </div>
        <div className="mt-auto pb-5">
          <SidebarFooter />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <div className="flex h-full w-full flex-col">
            <ScrollArea className="flex-1 px-4 py-5">
              <div className="mb-4">
                <h2 className="text-lg font-semibold tracking-tight">Gestione</h2>
                <p className="text-xs text-muted-foreground">Clienti • Interventi • Impianti</p>
              </div>
              <div className="space-y-1">
                <NavItems />
              </div>
            </ScrollArea>
            <div className="border-t bg-background/80 px-1 pb-5">
              <SidebarFooter />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}