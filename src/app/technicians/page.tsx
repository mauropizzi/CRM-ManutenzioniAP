"use client";

import { TechnicianTable } from '@/components/technician-table';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute } from '@/components/protected-route';

export default function TechniciansPage() {
  return (
    <ProtectedRoute>
      <div className="container-custom py-6 sm:py-8">
        <TechnicianTable />
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}