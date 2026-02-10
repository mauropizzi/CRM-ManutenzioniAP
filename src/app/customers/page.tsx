"use client";

import { CustomerTable } from '@/components/customer-table';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute } from '@/components/protected-route';

export default function CustomersPage() {
  return (
    <ProtectedRoute>
      <div className="container-custom py-6 sm:py-8">
        <CustomerTable />
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}