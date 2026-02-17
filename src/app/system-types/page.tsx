"use client";

import { Toaster } from "@/components/ui/sonner";
import { SystemTypeTable } from "@/components/system-type-table";

export default function SystemTypesPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
      <SystemTypeTable />
      <Toaster />
    </div>
  );
}