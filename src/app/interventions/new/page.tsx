"use client";

import React from 'react';
import { InterventionForm, InterventionFormValues } from '@/components/intervention-form';
import { useInterventionRequests } from '@/context/intervention-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// This prevents Next.js from trying to prerender this page during build
export const dynamic = 'force-dynamic';

export default function NewInterventionPage() {
  const router = useRouter();
  const { addInterventionRequest } = useInterventionRequests();

  const handleSubmit = async (data: InterventionFormValues) => {
    try {
      await addInterventionRequest(data as any);
      toast.success("Richiesta di intervento registrata con successo!");
      router.push('/interventions');
    } catch (error: any) {
      console.error('Error adding intervention:', error);
      toast.error(`Errore: ${error.message || 'Impossibile registrare la richiesta'}`);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Nuovo Intervento</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <InterventionForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}