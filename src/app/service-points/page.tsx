"use client";

import React from 'react';
import ServicePointTable from '@/components/service-point-table';
import { ServicePointProvider } from '@/context/service-point-context';
import { CustomerProvider } from '@/context/customer-context';
import { ProtectedRoute } from '@/components/protected-route';

export default function ServicePointsPage() {
  return (
    <ProtectedRoute>
      <CustomerProvider>
        <ServicePointProvider>
          <div className="container mx-auto p-6">
            <ServicePointTable />
          </div>
        </ServicePointProvider>
      </CustomerProvider>
    </ProtectedRoute>
  );
}