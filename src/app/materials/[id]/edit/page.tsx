"use client";

import React from 'react';
import { MaterialForm, MaterialFormValues } from '@/components/material-form';
import { useMaterials } from '@/context/material-context';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Material } from '@/types/material';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute } from '@/components/protected-route';

export default function EditMaterialPage({ params }: { params: { id: string } }) {
  const { id } = params; // Corretto da React.use(params)
  const { materials, updateMaterial } = useMaterials();
  const router = useRouter();

  const materialToEdit = materials.find((material) => material.id === id);

  if (!materialToEdit) {
    notFound();
  }

  const handleSubmit = async (data: MaterialFormValues) => {
    await updateMaterial({ ...materialToEdit, ...data } as Material);
    router.push('/materials');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Modifica Materiale</h1>
          <MaterialForm initialData={materialToEdit} onSubmit={handleSubmit} />
        </div>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}