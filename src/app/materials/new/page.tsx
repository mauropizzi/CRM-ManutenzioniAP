"use client";

import React from 'react';
import { MaterialForm, MaterialFormValues } from '@/components/material-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMaterials } from '@/context/material-context';
import { toast } from 'sonner';

// This prevents Next.js from trying to prerender this page during build
export const dynamic = 'force-dynamic';

export default function NewMaterialPage() {
  const router = useRouter();
  const { addMaterial } = useMaterials();

  const handleSubmit = async (data: MaterialFormValues) => {
    try {
      await addMaterial(data);
      toast.success("Materiale aggiunto con successo!");
      router.push('/materials');
    } catch (error: any) {
      console.error('Error adding material:', error);
      toast.error(`Errore: ${error.message || 'Impossibile aggiungere il materiale'}`);
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
        <h1 className="text-3xl font-bold tracking-tight">Nuovo Materiale</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <MaterialForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}