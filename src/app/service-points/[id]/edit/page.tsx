"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import ServicePointForm from '@/components/service-point-form';
import { ServicePointProvider, useServicePoints } from '@/context/service-point-context';
import type { ServicePoint, ServicePointWithSystems } from '@/types/service-point';
import { CustomerProvider } from '@/context/customer-context';
import { SystemTypeProvider } from '@/context/system-type-context';
import { BrandProvider } from '@/context/brand-context';
import { ProtectedRoute } from '@/components/protected-route';

function EditServicePointContent() {
  const params = useParams();
  const { servicePoints, loading } = useServicePoints();
  const servicePoint = servicePoints.find((sp: ServicePoint) => sp.id === params.id);
  
  if (loading || !servicePoint) {
    return <div className="p-8">Caricamento...</div>;
  }

  const servicePointWithSystems: ServicePointWithSystems = {
    ...servicePoint,
    systems: [],
  };

  return <ServicePointForm servicePoint={servicePointWithSystems} />;
}

export default function EditServicePointPage() {
  return (
    <ProtectedRoute>
      <CustomerProvider>
        <SystemTypeProvider>
          <BrandProvider>
            <ServicePointProvider>
              <EditServicePointContent />
            </ServicePointProvider>
          </BrandProvider>
        </SystemTypeProvider>
      </CustomerProvider>
    </ProtectedRoute>
  );
}