"use client";

import React from 'react';
import { CustomerForm, CustomerFormValues } from '@/components/customer-form';
import { useCustomers } from '@/context/customer-context';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Customer } from '@/types/customer';
import { Toaster } from '@/components/ui/sonner';

export default function EditCustomerPage({ params }: { params: { id: string } }) {
  const { id } = params; // Directly access id from params
  const { customers, updateCustomer } = useCustomers();
  const router = useRouter();

  const customerToEdit = customers.find((customer) => customer.id === id);

  if (!customerToEdit) {
    notFound();
  }

  const handleSubmit = async (data: CustomerFormValues) => {
    await updateCustomer({ ...customerToEdit, ...data } as Customer);
    router.push('/customers');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Modifica Cliente</h1>
        <CustomerForm initialData={customerToEdit} onSubmit={handleSubmit} />
      </div>
      <Toaster />
    </div>
  );
}