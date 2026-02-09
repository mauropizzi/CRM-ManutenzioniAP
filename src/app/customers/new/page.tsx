"use client";

import React from 'react';
import { CustomerForm, CustomerFormValues } from '@/components/customer-form';
import { useCustomers } from '@/context/customer-context';
import { useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute } from '@/components/protected-route';

export default function NewCustomerPage() {
  const { addCustomer } = useCustomers();
  const router = useRouter();

  const handleSubmit = async (data: CustomerFormValues) => {
    await addCustomer(data);
    router.push('/customers');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Aggiungi Nuovo Cliente</h1>
          <CustomerForm onSubmit={handleSubmit} />
        </div>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}