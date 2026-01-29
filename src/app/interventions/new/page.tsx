"use client";

import React from 'react';
import { InterventionForm, InterventionFormValues } from '@/components/intervention-form';
import { useInterventionRequests } from '@/context/intervention-context';
import { useRouter } from 'next/navigation';
import { InterventionRequest } from '@/types/intervention';
import { Toaster } from '@/components/ui/sonner';

export default function NewInterventionPage() {
  const { addInterventionRequest } = useInterventionRequests();
  const router = useRouter();

  const handleSubmit = async (data: InterventionFormValues) => {
    await addInterventionRequest(data as Omit<InterventionRequest, 'id'>);
    router.push('/interventions');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Registra Nuova Richiesta di Intervento</h1>
        <InterventionForm onSubmit={handleSubmit} />
      </div>
      <Toaster />
    </div>
  );
}