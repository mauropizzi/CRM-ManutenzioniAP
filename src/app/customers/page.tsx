"use client";

import { CustomerTable } from '@/components/customer-table';
import { Toaster } from '@/components/ui/sonner';

export default function CustomersPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
      <CustomerTable />
      <Toaster />
    </div>
  );
}