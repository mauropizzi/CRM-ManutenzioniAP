"use client";

import React, { use, useEffect } from 'react';
import { useInterventionRequests } from '@/context/intervention-context';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { PrintableWorkReport } from '@/components/printable-work-report';
import { Loader2 } from 'lucide-react';

interface PrintWorkReportPageProps {
  params: { // Modificato da Promise<{ id: string; }> a { id: string; }
    id: string;
  };
}

export default function PrintWorkReportPage({ params }: PrintWorkReportPageProps) {
  const { id } = params; // Accesso diretto all'ID
  const { interventionRequests, loading: interventionsLoading } = useInterventionRequests();
  const router = useRouter();

  const intervention = interventionRequests.find((request) => request.id === id);

  useEffect(() => {
    if (!interventionsLoading && intervention) {
      // Attendiamo un breve momento per assicurare che il DOM sia renderizzato
      const timer = setTimeout(() => {
        window.print();
        // Dopo la stampa, torna alla pagina degli interventi
        router.push(`/interventions/${id}/work-report`);
      }, 500); // Breve ritardo
      return () => clearTimeout(timer);
    } else if (!interventionsLoading && !intervention) {
      notFound();
    }
  }, [interventionsLoading, intervention, router, id]);

  if (interventionsLoading || !intervention) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2 text-gray-700 dark:text-gray-300">Caricamento bolla di consegna...</p>
      </div>
    );
  }

  return (
    <div className="print:block hidden"> {/* Questo div sarà visibile solo in modalità stampa */}
      <PrintableWorkReport intervention={intervention} />
    </div>
  );
}