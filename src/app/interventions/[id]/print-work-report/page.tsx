"use client";

import React, { useEffect, use } from 'react';
import { useInterventionRequests } from '@/context/intervention-context';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { PrintableWorkReport } from '@/components/printable-work-report';
import { Loader2 } from 'lucide-react';

interface PrintWorkReportPageProps {
  params: Promise<{ id: string }>;
}

export default function PrintWorkReportPage({ params }: PrintWorkReportPageProps) {
  const { id } = use(params);
  const { interventionRequests, loading: interventionsLoading } = useInterventionRequests();

  const intervention = interventionRequests.find((request) => request.id === id);

  useEffect(() => {
    if (!interventionsLoading && intervention) {
      // Rimuovi eventuali stili indesiderati prima della stampa
      document.body.style.backgroundColor = 'white';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      
      const timer = setTimeout(() => {
        window.print();
        // Chiudi la finestra dopo la stampa
        setTimeout(() => {
          window.close();
        }, 100);
      }, 1000);
      
      return () => {
        clearTimeout(timer);
      };
    } else if (!interventionsLoading && !intervention) {
      notFound();
    }
  }, [interventionsLoading, intervention, id]);

  if (interventionsLoading || !intervention) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white no-print">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2 text-gray-700">Caricamento bolla di consegna...</p>
      </div>
    );
  }

  return (
    <div className="print-content w-full bg-white">
      <PrintableWorkReport intervention={intervention} />
    </div>
  );
}