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
          <InterventionForm onSubmit={handleSubmit} />
          <Toaster />
        </BrandProvider>
      </SystemTypeProvider>
    </ProtectedRoute>
  );
}