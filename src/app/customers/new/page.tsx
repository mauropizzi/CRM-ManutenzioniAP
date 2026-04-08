"use client";

import React from 'react';
import { CustomerForm, CustomerFormValues } from '@/components/customer-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCustomers } from '@/context/customer-context';
import { toast } from 'sonner';

// This prevents Next.js from trying to prerender this page during build
export const dynamic = 'force-dynamic';

export default function NewCustomerPage() {
  const router = useRouter();
  const { addCustomer } = useCustomers();

  const handleSubmit = async (data: CustomerFormValues) => {
    try {
      await addCustomer(data);
      toast.success("Cliente aggiunto con successo!");
      router.push('/customers');
    } catch (error: any) {
      console.error('Error adding customer:', error);
      toast.error(`Errore: ${error.message || 'Impossibile aggiungere il cliente'}`);
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
        <h1 className="text-3xl font-bold tracking-tight">Nuovo Cliente</h1>
      </div>
      
      <CustomerForm onSubmit={handleSubmit} />
    </div>
  );
}