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
      <div className="px-4 pt-6">
        <Link href="/login" className="block">
          <Button
            variant="outline"
            className="w-full justify-start h-10"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Accedi
          </Button>
        </Link>
        <div className="mt-4 flex justify-center">
          <ThemeToggle />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="rounded-xl border border-border bg-surface p-3">
        <p className="text-xs text-text-secondary mb-1">Connesso come</p>
        <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
      </div>
      <div className="flex justify-center">
        <ThemeToggle />
      </div>
      <Button
        variant="ghost"
        className="w-full justify-start h-10 text-danger hover:bg-danger/10 hover:text-danger"
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
              variant={isActive ? 'primary' : 'ghost'}
              className={cn(
                'w-full justify-start h-10 px-4',
                !isActive && 'hover:bg-accent hover:text-accent-foreground',
                isActive && 'shadow-sm'
              )}
            >
              <item.icon className="mr-3 h-4 w-4" />
              <span className="font-medium">{item.name}</span>
            </Button>
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn('hidden lg:flex lg:flex-col lg:w-72 border-r border-border bg-surface', className)}>
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Gestione</h2>
                <p className="text-xs text-text-secondary">Clienti • Interventi • Impianti</p>
              </div>
            </div>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-1">
              <NavItems />
            </div>
          </ScrollArea>
          <div className="border-t border-border">
            <SidebarFooter />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <div className="flex h-full flex-col">
            <div className="p-6 border-b border-border bg-surface">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Gestione</h2>
                  <p className="text-xs text-text-secondary">Clienti • Interventi • Impianti</p>
                </div>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-1">
                <NavItems />
              </div>
            </ScrollArea>
            <div className="border-t border-border bg-surface">
              <SidebarFooter />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}