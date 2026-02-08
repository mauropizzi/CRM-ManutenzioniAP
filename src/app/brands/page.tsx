"use client";

import { ProtectedRoute } from '@/components/protected-route';
import { Toaster } from '@/components/ui/sonner';
import { BrandManager } from '@/components/brand-manager';
import { BrandProvider } from '@/context/brand-context';

export default function BrandsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8 dark:bg-slate-950">
        <BrandProvider>
          <BrandManager />
        </BrandProvider>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}
