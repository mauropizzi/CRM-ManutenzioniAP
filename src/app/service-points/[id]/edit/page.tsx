"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import ServicePointForm from '@/components/service-point-form';
import { ServicePointProvider, useServicePoint } from '@/context/service-point-context';

function EditServicePointContent() {
  const params = useParams();
  const { servicePoints, loading } = useServicePoint();
  const servicePoint = servicePoints.find((sp) => sp.id === params.id);

  if (loading) return <div>Caricamento...</div>;
  if (!servicePoint) return <div>Punto servizio non trovato</div>;

  return <ServicePointForm servicePoint={servicePoint} />;
}

export default function EditServicePointPage() {
  return (
    <ServicePointProvider>
      <EditServicePointContent />
    </ServicePointProvider>
  );
}