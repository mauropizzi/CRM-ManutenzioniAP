"use client";

import React from 'react';
import { InterventionConclusionForm, InterventionConclusionFormValues } from '@/components/intervention-conclusion-form';
import { useInterventionRequests } from '@/context/intervention-context';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { InterventionRequest } from '@/types/intervention';
import { Toaster } from '@/components/ui/sonner';

interface ConcludeInterventionPageProps {
  params: {
    id: string;
  };
}

export default function ConcludeInterventionPage({ params }: ConcludeInterventionPageProps) {
  const { id } = params;
  const { interventionRequests, updateInterventionRequest } = useInterventionRequests();
  const router = useRouter();

  const interventionToConclude = interventionRequests.find((request) => request.id === id);

  if (!interventionToConclude) {
    notFound();
  }

  const handleSubmit = (data: InterventionConclusionFormValues) => {
    // Aggiorna lo stato dell'intervento a 'Completato' se l'utente ha spuntato "Intervento concluso"
    const updatedStatus = data.intervention_concluded ? 'Completato' : interventionToConclude.status;

    updateInterventionRequest({
      ...interventionToConclude,
      ...data,
      status: updatedStatus,
    });
    router.push('/interventions'); // Reindirizza a una pagina di elenco interventi (da creare)
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