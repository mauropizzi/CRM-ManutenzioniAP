"use client";

import { ProtectedRoute } from '@/components/protected-route';
import { Toaster } from '@/components/ui/sonner';
import { SystemTypeManager } from '@/components/system-type-manager';
import { SystemTypeProvider } from '@/context/system-type-context';

export default function SystemTypesPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8 dark:bg-slate-950">
        <SystemTypeProvider>
          <SystemTypeManager />
        </SystemTypeProvider>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}
