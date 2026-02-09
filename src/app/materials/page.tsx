"use client";

import { MaterialTable } from '@/components/material-table';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute } from '@/components/protected-route';

export default function MaterialsPage() {
  return (
    <ProtectedRoute>
      <div className="container-base py-6">
        <MaterialTable />
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}