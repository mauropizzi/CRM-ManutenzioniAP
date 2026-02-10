"use client";

import { MaterialTable } from '@/components/material-table';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute } from '@/components/protected-route';

export default function MaterialsPage() {
  return (
    <ProtectedRoute>
      <div className="container-custom py-6 sm:py-8">
        <MaterialTable />
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}