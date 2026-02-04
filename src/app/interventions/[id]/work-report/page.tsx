"use client";

import React from 'react';
import { use } from 'react';
import { WorkReportForm, WorkReportFormValues } from '@/components/work-report-form';
import { useInterventionRequests } from '@/context/intervention-context';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';

interface WorkReportPageProps {
  params: Promise<{ id: string }>;
}

export default function WorkReportPage({ params }: WorkReportPageProps) {
  const { id } = use(params);
  const { interventionRequests, updateInterventionRequest } = useInterventionRequests();
  const router = useRouter();

  const intervention = interventionRequests.find((request) => request.id === id);

  if (!intervention) {
    notFound();
  }

  const handleSubmit = async (data: WorkReportFormValues) => {
    const { status, ...workReportDataFields } = data;

    await updateInterventionRequest({
      ...intervention,
      work_report_data: workReportDataFields,
      status: status,
    });
    router.push('/interventions');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Bolla di Consegna
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Intervento per: {intervention.client_company_name} - {intervention.system_type}{" "}
            {intervention.brand} {intervention.model}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
          <WorkReportForm
            initialData={{ ...(intervention.work_report_data ?? {}), id: intervention.id }}
            onSubmit={handleSubmit}
            clientName={intervention.client_company_name}
            clientEmail={intervention.client_email}
            currentStatus={intervention.status}
          />
        </div>
      </div>
      <Toaster />
    </div>
  );
}