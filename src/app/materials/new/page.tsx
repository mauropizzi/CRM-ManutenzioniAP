"use client";

import React from 'react';
import { MaterialForm, MaterialFormValues } from '@/components/material-form';
import { useMaterials } from '@/context/material-context';
import { useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

export default function NewMaterialPage() {
  const { addMaterial } = useMaterials();
  const router = useRouter();

  const handleSubmit = async (data: MaterialFormValues) => {
    console.log('Form submitted with data:', data);
    try {
      await addMaterial(data);
      console.log('Material added successfully');
      toast.success("Materiale aggiunto con successo!");
      router.push('/materials');
    } catch (error: any) {
      console.error('Error adding material:', error);
      toast.error(`Errore: ${error.message || 'Impossibile aggiungere il materiale'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Aggiungi Nuovo Materiale</h1>
        <MaterialForm onSubmit={handleSubmit} />
      </div>
      <Toaster />
    </div>
  );
}