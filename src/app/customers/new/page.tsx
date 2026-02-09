"use client";

import React from 'react';
import CustomerForm from '@/components/customer-form';
import { CustomerProvider } from '@/context/customer-context';
import { SystemTypeProvider } from '@/context/system-type-context';
import { BrandProvider } from '@/context/brand-context';
import { ProtectedRoute } from '@/components/protected-route';

export default function NewCustomerPage() {
  return (
    <ProtectedRoute>
      <CustomerProvider>
        <SystemTypeProvider>
          <BrandProvider>
            <div className="min-h-screen bg-slate-50 p-4 sm:p-8 dark:bg-slate-950">
              <CustomerForm />
            </div>
          </BrandProvider>
        </SystemTypeProvider>
      </CustomerProvider>
    </ProtectedRoute>
  );
}