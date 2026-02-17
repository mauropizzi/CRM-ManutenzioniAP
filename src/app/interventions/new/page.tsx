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
import { supabase } from '@/lib/supabase';

export default function NewInterventionPage() {
  const router = useRouter();

  const handleSubmit = async (data: InterventionFormValues) => {
    try {
      const { data: intervention } = await supabase
        .from('intervention_requests')
        .insert([data])
        .select()
        .single();
      
      if (intervention) {
        router.push(`/interventions/${intervention.id}/edit`);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Errore durante la creazione dell\'intervento');
    }
  };

  return (
    <ProtectedRoute>
      <SystemTypeProvider>
        <BrandProvider>
          <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
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