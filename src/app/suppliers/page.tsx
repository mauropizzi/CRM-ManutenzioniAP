"use client";

import React from 'react';
import { SupplierTable } from '@/components/supplier-table';
import { Toaster } from '@/components/ui/sonner';

export default function SuppliersPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
      <SupplierTable />
      <Toaster />
    </div>
  );
}