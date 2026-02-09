"use client";

import React from 'react';
import ServicePointForm from '@/components/service-point-form';
import { ServicePointProvider } from '@/context/service-point-context';
import { CustomerProvider } from '@/context/customer-context';
import { SystemTypeProvider } from '@/context/system-type-context';
import { BrandProvider } from '@/context/brand-context';
import { ProtectedRoute } from '@/components/protected-route';

export default function NewServicePointPage() {
  return (
    <ProtectedRoute>
      <CustomerProvider>
        <SystemTypeProvider>
          <BrandProvider>
            <ServicePointProvider>
              <ServicePointForm />
            </ServicePointProvider>
          </BrandProvider>
        </SystemTypeProvider>
      </CustomerProvider>
    </ProtectedRoute>
  );
}