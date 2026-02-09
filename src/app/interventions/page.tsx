"use client";

import { InterventionTable } from '@/components/intervention-table';
import { ProtectedRoute } from '@/components/protected-route';

export default function InterventionsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
        <InterventionTable />
      </div>
    </ProtectedRoute>
  );
}
