"use client";

import { InterventionTable } from '@/components/intervention-table';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute } from '@/components/protected-route';

export default function InterventionsPage() {
  return (
    <ProtectedRoute>
      <div className="container-base py-6">
        <InterventionTable />
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}