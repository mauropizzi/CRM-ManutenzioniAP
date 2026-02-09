"use client";

import { MaterialTable } from '@/components/material-table';
import { ProtectedRoute } from '@/components/protected-route';

export default function MaterialsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
        <MaterialTable />
      </div>
    </ProtectedRoute>
  );
}