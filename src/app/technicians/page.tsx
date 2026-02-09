"use client";

import { TechnicianTable } from '@/components/technician-table';
import { ProtectedRoute } from '@/components/protected-route';

export default function TechniciansPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
        <TechnicianTable />
      </div>
    </ProtectedRoute>
  );
}