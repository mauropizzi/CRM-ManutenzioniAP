"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import CustomerForm from '@/components/customer-form';
import { CustomerProvider, useCustomers } from '@/context/customer-context';
import { SystemTypeProvider } from '@/context/system-type-context';
import { BrandProvider } from '@/context/brand-context';
import { ProtectedRoute } from '@/components/protected-route';

function EditCustomerContent() {
  const params = useParams();
  const { customers, loading } = useCustomers();
  const customer = customers.find((c) => c.id === params.id);

  if (loading) return <div>Caricamento...</div>;
  if (!customer) return <div>Cliente non trovato</div>;

  return <CustomerForm customer={customer} />;
}

export default function EditCustomerPage() {
  return (
    <ProtectedRoute>
      <CustomerProvider>
        <SystemTypeProvider>
          <BrandProvider>
            <div className="min-h-screen bg-slate-50 p-4 sm:p-8 dark:bg-slate-950">
              <EditCustomerContent />
            </div>
          </BrandProvider>
        </SystemTypeProvider>
      </CustomerProvider>
    </ProtectedRoute>
  );
}