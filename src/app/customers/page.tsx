"use client";

import { CustomerTable } from '@/components/customer-table';
import { ProtectedRoute } from '@/components/protected-route';

export default function CustomersPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
        <CustomerTable />
      </div>
    </ProtectedRoute>
  );
}