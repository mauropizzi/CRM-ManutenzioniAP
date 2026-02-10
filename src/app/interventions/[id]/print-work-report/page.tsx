"use client";

import React, { useEffect, use } from 'react';
import { fetchWorkReportPdf } from '@/lib/email-utils';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface PrintWorkReportPageProps {
  params: Promise<{ id: string }>;
}

export default function PrintWorkReportPage({ params }: PrintWorkReportPageProps) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { pdfBase64, filename } = await fetchWorkReportPdf(id);
        if (cancelled) return;

        const bytes = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        window.open(url, '_blank', 'noopener,noreferrer');

        setTimeout(() => URL.revokeObjectURL(url), 10_000);
      } finally {
        // Torna alla bolla (operativo)
        router.replace(`/interventions/${id}/work-report`);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-gray-50 dark:bg-gray-950">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="ml-2 text-gray-700 dark:text-gray-300">Generazione PDF in corso...</p>
    </div>
  );
}