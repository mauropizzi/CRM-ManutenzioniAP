"use client";

import React from 'react';
import { useInterventionRequests } from '@/context/intervention-context';
import { notFound } from 'next/navigation';
import { PrintableWorkReport } from '@/components/printable-work-report';
import { Loader2 } from 'lucide-react';

interface PrintWorkReportPageProps {
  params: {
    id: string;
  };
}

export default function PrintWorkReportPage({ params }: PrintWorkReportPageProps) {
  const { id } = React.use(params);
  const { interventionRequests, loading: interventionsLoading } = useInterventionRequests();

  const intervention = interventionRequests.find((request) => request.id === id);

  if (interventionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2 text-gray-700 dark:text-gray-300">Caricamento bolla di consegna...</p>
      </div>
    );
  }

  if (!intervention) {
    notFound();
  }

  // Rimosso useEffect per window.print() e router.push.
  // La pagina ora visualizzerà semplicemente il contenuto di PrintableWorkReport.

  return (
    <div> {/* Nessuna classe di stampa specifica qui, layout.tsx gestisce gli stili del body */}
      <PrintableWorkReport intervention={intervention} />
    </div>
  );
}