"use client";

import React from 'react';
import { TechnicianForm, TechnicianFormValues } from '@/components/technician-form';
import { useTechnicians } from '@/context/technician-context';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Technician } from '@/types/technician';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute } from '@/components/protected-route';
import { use } from 'react';

type EditTechnicianPageProps = {
  params: Promise<{ id: string }>;
};

export default function EditTechnicianPage({ params }: EditTechnicianPageProps) {
  const { id } = use(params);
  const { technicians, updateTechnician } = useTechnicians();
  const router = useRouter();

  const technicianToEdit = technicians.find((technician) => technician.id === id);

  if (!technicianToEdit) {
    notFound();
  }

  const handleSubmit = async (data: TechnicianFormValues) => {
    await updateTechnician({ ...technicianToEdit, ...data } as Technician);
    router.push('/technicians');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Modifica Tecnico</h1>
          <TechnicianForm initialData={technicianToEdit} onSubmit={handleSubmit} />
        </div>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}