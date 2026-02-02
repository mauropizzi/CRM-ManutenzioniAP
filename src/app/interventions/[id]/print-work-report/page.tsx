"use client";

import React, { useEffect } from 'react';
import { useInterventionRequests } from '@/context/intervention-context';
import { notFound, useRouter } from 'next/navigation';
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
  const router = useRouter();

  const intervention = interventionRequests.find((request) => request.id === id);

  useEffect(() => {
    if (!interventionsLoading && intervention) {
      // Give a small delay to ensure the component is fully rendered before printing
      const printTimeout = setTimeout(() => {
        window.print();
        // After printing (or closing the print dialog), navigate back
        router.push('/interventions');
      }, 500); // Adjust delay as needed

      return () => clearTimeout(printTimeout);
    }
  }, [interventionsLoading, intervention, router]);

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

  return (
    <div>
      <PrintableWorkReport intervention={intervention} />
    </div>
  );
}