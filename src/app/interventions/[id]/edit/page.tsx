"use client";

import React from 'react';
import { InterventionForm, InterventionFormValues } from '@/components/intervention-form';
import { useInterventionRequests } from '@/context/intervention-context';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { InterventionRequest } from '@/types/intervention';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute } from '@/components/protected-route';
import { toast } from 'sonner';
import { use } from 'react';

interface EditInterventionPageProps {
  params: Promise<{ id: string }>;
}

export default function EditInterventionPage({ params }: EditInterventionPageProps) {
  const { id } = use(params);
  const { interventionRequests, updateInterventionRequest } = useInterventionRequests();
  const router = useRouter();

  const interventionToEdit = interventionRequests.find((request) => request.id === id);

  if (!interventionToEdit) {
    notFound();
  }

  const handleSubmit = async (data: InterventionFormValues) => {
    console.log('Form submitted with data:', data);
    try {
      await updateInterventionRequest({ ...interventionToEdit, ...data } as InterventionRequest);
      console.log('Intervention updated successfully');
      toast.success("Intervento aggiornato con successo!");
      router.push('/interventions');
    } catch (error: any) {
      console.error('Error updating intervention:', error);
      toast.error(`Errore: ${error.message || 'Impossibile aggiornare l\'intervento'}`);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Modifica Richiesta di Intervento</h1>
          <InterventionForm initialData={interventionToEdit} onSubmit={handleSubmit} />
        </div>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}