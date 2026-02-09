"use client";

import React from 'react';
import ServicePointForm from '@/components/service-point-form';
import { ServicePointProvider } from '@/context/service-point-context';
import { CustomerProvider } from '@/context/customer-context';
import { ProtectedRoute } from '@/components/protected-route';

export default function NewServicePointPage() {
  return (
    <ProtectedRoute>
      <CustomerProvider>
        <ServicePointProvider>
          <ServicePointForm />
        </ServicePointProvider>
      </CustomerProvider>
    </ProtectedRoute>
  );
}