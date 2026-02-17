"use client";

import React from 'react';
import { TechnicianForm, TechnicianFormValues } from '@/components/technician-form';
import { useTechnicians } from '@/context/technician-context';
import { useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute } from '@/components/protected-route';
import { toast } from 'sonner';

export default function NewTechnicianPage() {
  const { createTechnician } = useTechnicians();
  const router = useRouter();

  const handleSubmit = async (data: TechnicianFormValues) => {
    console.log('Form submitted with data:', data);
    try {
      await createTechnician(data as any);
      console.log('Technician added successfully');
      toast.success("Tecnico aggiunto con successo!");
      router.push('/technicians');
    } catch (error: any) {
      console.error('Error adding technician:', error);
      toast.error(`Errore: ${error.message || 'Impossibile aggiungere il tecnico'}`);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Aggiungi Nuovo Tecnico</h1>
          <TechnicianForm onSubmit={handleSubmit} />
        </div>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}