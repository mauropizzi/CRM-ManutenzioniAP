"use client";

import { MaterialTable } from '@/components/material-table';
import { Toaster } from '@/components/ui/sonner';

export default function MaterialsPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
      <MaterialTable />
      <Toaster />
    </div>
  );
}