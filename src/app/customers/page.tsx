"use client";

import { CustomerTable } from '@/components/customer-table';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute } from '@/components/protected-route';

export default function CustomersPage() {
  return (
    <ProtectedRoute>
      <div className="container-base py-6">
        <CustomerTable />
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}