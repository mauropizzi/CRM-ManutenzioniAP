"use client";

import React from 'react';
import { InterventionTable } from '@/components/intervention-table';
import { Toaster } from '@/components/ui/sonner';

// This prevents Next.js from trying to prerender this page during build
export const dynamic = 'force-dynamic';

export default function InterventionsPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
      <InterventionTable />
      <Toaster />
    </div>
  );
}