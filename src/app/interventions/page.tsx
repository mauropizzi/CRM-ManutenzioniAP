"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/context/profile-context';
import { InterventionTable } from '@/components/intervention-table';
import { Toaster } from '@/components/ui/sonner';

export default function InterventionsPage() {
  const router = useRouter();
  const { profile, isLoading } = useProfile();

  useEffect(() => {
    if (!isLoading && !profile) {
      router.push('/');
    }
  }, [profile, isLoading, router]);

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
      <InterventionTable />
      <Toaster />
    </div>
  );
}