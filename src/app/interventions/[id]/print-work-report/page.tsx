"use client";

import React, { useEffect, use } from 'react';
import { useInterventionRequests } from '@/context/intervention-context';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { PrintableWorkReport } from '@/components/printable-work-report';
import { Loader2, ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';

interface PrintWorkReportPageProps {
  params: Promise<{ id: string }>;
}

export default function PrintWorkReportPage({ params }: PrintWorkReportPageProps) {
  const { id } = use(params);
  const { interventionRequests, loading: interventionsLoading } = useInterventionRequests();
  const router = useRouter();

  const intervention = interventionRequests.find((request) => request.id === id);

  useEffect(() => {
    if (!interventionsLoading && intervention) {
      const timer = setTimeout(() => {
        window.print();
        router.push(`/interventions/${id}/work-report`);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!interventionsLoading && !intervention) {
      notFound();
    }
  }, [interventionsLoading, intervention, router, id]);

  const handlePrintNow = () => {
    window.print();
  };

  if (interventionsLoading || !intervention) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Caricamento bolla di consegna</h2>
          <p className="text-text-secondary">Preparazione del documento per la stampa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header buttons - hidden during print */}
      <div className="border-b border-border bg-surface p-4 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/interventions/${id}/work-report`}>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Indietro
              </button>
            </Link>
            <h1 className="text-lg font-semibold text-foreground">
              Bolla di Consegna - {intervention.client_company_name}
            </h1>
          </div>
          <button
            onClick={handlePrintNow}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Printer className="h-4 w-4" />
            Stampa Ora
          </button>
        </div>
      </div>

      {/* Print content - visible only during print */}
      <div className="print:block hidden">
        <PrintableWorkReport intervention={intervention} />
      </div>

      {/* Preview content - visible only on screen */}
      <div className="p-8 print:hidden">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Anteprima di Stampa</h2>
            <p className="text-text-secondary">La bolla di consegna si stamperà automaticamente. Puoi usare il pulsante in alto per stampare manualmente.</p>
          </div>
          
          <div className="border-2 border-border rounded-lg bg-surface p-6 shadow-lg">
            <PrintableWorkReport intervention={intervention} />
          </div>
        </div>
      </div>
    </div>
  );
}