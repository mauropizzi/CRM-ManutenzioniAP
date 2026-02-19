"use client";

import React from 'react';
import ServicePointForm from '@/components/service-point-form';
import { ServicePointProvider } from '@/context/service-point-context';

export default function NewServicePointPage() {
  return (
    <ServicePointProvider>
      <ServicePointForm />
    </ServicePointProvider>
  );
}