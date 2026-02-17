"use client";

import { Toaster } from "@/components/ui/sonner";
import { BrandProvider } from "@/context/brand-context";
import { BrandTable } from "@/components/brand-table";

export default function BrandsPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
      <BrandProvider>
        <BrandTable />
      </BrandProvider>
      <Toaster />
    </div>
  );
}