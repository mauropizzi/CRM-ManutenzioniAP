"use client";

import React from 'react';
import { use } from 'react';
import { InterventionForm, InterventionFormValues } from '@/components/intervention-form';
import { useInterventionRequests } from '@/context/intervention-context';
import { useRouter, notFound } from 'next/navigation';
import { InterventionRequest } from '@/types/intervention';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

interface EditInterventionPageProps {
  params: Promise<{ id: string }>;
}

export default function EditInterventionPage({ params }: EditInterventionPageProps) {
  const { id } = use(params);
  const { interventionRequests, updateInterventionRequest, refreshInterventions } = useInterventionRequests();
  const router = useRouter();
  const interventionToEdit = interventionRequests.find((request) => request.id === id);

  if (!interventionToEdit) {
    notFound();
  }

  const handleSubmit = async (data: InterventionFormValues) => {
    console.log('Form submitted with data:', data);
    
    try {
      await updateInterventionRequest({ ...interventionToEdit, ...data } as InterventionRequest);
      console.log('Intervento aggiornato con successo!');
      
      // Sincronizza i dati delle richieste per assicurare che siano aggiornati prima della navigazione
      await refreshInterventions();
      
      toast.success('Intervento aggiornato con successo!');
      
      // Naviga alla lista interventi dopo che i dati sono sincronizzati
      router.push('/interventions');
    } catch (error: any) {
      console.error('Error updating intervention:', error);
      toast.error(`Errore: ${error.message || "Impossibile aggiornare l'intervento"}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Modifica Richiesta di Intervento
        </h1>
        <InterventionForm initialData={interventionToEdit} onSubmit={handleSubmit} />
      </div>
      <Toaster />
    </div>
  );
}