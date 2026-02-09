"use client";

import React, { useEffect, use } from 'react';
import { useInterventionRequests } from '@/context/intervention-context';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { PrintableWorkReport } from '@/components/printable-work-report';
import { Loader2 } from 'lucide-react';
import Script from 'next/script';

interface PrintWorkReportPageProps {
  params: Promise<{ id: string }>;
}

export default function PrintWorkReportPage({ params }: PrintWorkReportPageProps) {
  const { id } = use(params);
  const { interventionRequests, loading: interventionsLoading } = useInterventionRequests();

  const intervention = interventionRequests.find((request) => request.id === id);

  useEffect(() => {
    if (!interventionsLoading && intervention) {
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!interventionsLoading && !intervention) {
      notFound();
    }
  }, [interventionsLoading, intervention, id]);

  if (interventionsLoading || !intervention) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2 text-gray-700">Caricamento bolla di consegna...</p>
      </div>
    );
  }

  return (
    <>
      <Script id="print-styles" strategy="beforeInteractive">
        {`
          @page {
            margin: 1cm;
            size: A4;
          }
          
          * {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            font-family: 'Inter', sans-serif;
          }
          
          @media print {
            body {
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `}
      </Script>
      <div className="w-full bg-white print:p-8">
        <PrintableWorkReport intervention={intervention} />
      </div>
    </>
  );
}