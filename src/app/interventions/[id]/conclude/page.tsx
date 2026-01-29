"use client";

import React, { use } from 'react';
import { InterventionConclusionForm, InterventionConclusionFormValues } from '@/components/intervention-conclusion-form';
import { useInterventionRequests } from '@/context/intervention-context';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { InterventionRequest } from '@/types/intervention';
import { Toaster } from '@/components/ui/sonner';

interface ConcludeInterventionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ConcludeInterventionPage({ params }: ConcludeInterventionPageProps) {
  const { id } = use(params);
  const { interventionRequests, updateInterventionRequest } = useInterventionRequests();
  const router = useRouter();

  const interventionToConclude = interventionRequests.find((request) => request.id === id);

  if (!interventionToConclude) {
    notFound();
  }

  const handleSubmit = async (data: InterventionConclusionFormValues) => {
    const updatedStatus = data.intervention_concluded ? 'Completato' : interventionToConclude.status;

    await updateInterventionRequest({
      ...interventionToConclude,
      ...data,
      status: updatedStatus,
    });
    router.push('/interventions');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Concludi Richiesta di Intervento</h1>
        <InterventionConclusionForm initialData={interventionToConclude} onSubmit={handleSubmit} />
      </div>
      <Toaster />
    </div>
  );
}