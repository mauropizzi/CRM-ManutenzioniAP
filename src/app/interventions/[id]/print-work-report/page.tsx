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
  const router = useRouter();

  const intervention = interventionRequests.find((request) => request.id === id);

  useEffect(() => {
    if (!interventionsLoading && intervention) {
      // Rimuovi eventuali stili di background e layout per la stampa
      document.body.style.backgroundColor = 'white';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      
      const timer = setTimeout(() => {
        window.print();
        // Ripristina gli stili originali dopo la stampa
        document.body.style.backgroundColor = '';
        document.body.style.margin = '';
        document.body.style.padding = '';
        router.push(`/interventions/${id}/work-report`);
      }, 500);
      return () => {
        clearTimeout(timer);
        // Pulizia degli stili quando il componente si smonta
        document.body.style.backgroundColor = '';
        document.body.style.margin = '';
        document.body.style.padding = '';
      };
    } else if (!interventionsLoading && !intervention) {
      notFound();
    }
  }, [interventionsLoading, intervention, router, id]);

  if (interventionsLoading || !intervention) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2 text-gray-700">Caricamento bolla di consegna...</p>
      </div>
    );
  }

  // Componente di stampa standalone senza layout
  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            margin: 1cm;
            size: A4;
          }
          
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          * {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
        
        body {
          background: white;
          margin: 0;
          padding: 20px;
          font-family: Inter, sans-serif;
        }
        
        .no-print {
          display: none !important;
        }
      `}</style>
      <div className="w-full max-w-none">
        <PrintableWorkReport intervention={intervention} />
      </div>
    </>
  );
}