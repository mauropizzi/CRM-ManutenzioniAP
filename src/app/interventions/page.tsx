"use client";

import { InterventionTable } from '@/components/intervention-table';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute } from '@/components/protected-route';

export default function InterventionsPage() {
  return (
    <ProtectedRoute>
      <div className="container-custom py-6 sm:py-8">
        <InterventionTable />
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}