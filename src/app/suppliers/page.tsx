"use client";

import { SupplierTable } from '@/components/supplier-table';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute } from '@/components/protected-route';

export default function SuppliersPage() {
  return (
    <ProtectedRoute>
      <div className="container-custom py-6 sm:py-8">
        <SupplierTable />
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}