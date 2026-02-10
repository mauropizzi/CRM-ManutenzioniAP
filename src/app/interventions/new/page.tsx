"use client";

import React from 'react';
import { InterventionForm, InterventionFormValues } from '@/components/intervention-form';
import { useInterventionRequests } from '@/context/intervention-context';
import { useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute } from '@/components/protected-route';
import { toast } from 'sonner';
import { SystemTypeProvider } from '@/context/system-type-context';
import { BrandProvider } from '@/context/brand-context';

export default function NewInterventionPage() {
  const { addInterventionRequest } = useInterventionRequests();
  const router = useRouter();

  const handleSubmit = async (data: InterventionFormValues) => {
    console.log('Form submitted with data:', data);
    try {
      await addInterventionRequest(data);
      console.log('Intervention added successfully');
      toast.success('Intervento registrato con successo!');
      router.push('/interventions');
    } catch (error: any) {
      console.error('Error adding intervention:', error);
      toast.error(`Errore: ${error.message || "Impossibile registrare l'intervento"}`);
    }
  };

  return (
    <ProtectedRoute>
      <SystemTypeProvider>
        <BrandProvider>
          <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto card-base p-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                Registra Nuova Richiesta di Intervento
              </h1>
              <InterventionForm onSubmit={handleSubmit} />
            </div>
            <Toaster />
          </div>
        </BrandProvider>
      </SystemTypeProvider>
    </ProtectedRoute>
  );
}