"use client";

import React, { use, useState } from 'react';
import { WorkReportForm, WorkReportFormValues } from '@/components/work-report-form';
import { useInterventionRequests } from '@/context/intervention-context';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useMaterials } from '@/context/material-context';
import { supabase } from '@/integrations/supabase/client';

interface WorkReportPageProps {
  params: Promise<{ id: string }>;
}

const normalize = (s: string) => s.trim().toLowerCase();

export default function WorkReportPage({ params }: WorkReportPageProps) {
  const { id } = use(params);
  const { interventionRequests, updateInterventionRequest } = useInterventionRequests();
  const { materials: catalogMaterials, refreshMaterials } = useMaterials();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const intervention = interventionRequests.find((request) => request.id === id);

  if (!intervention) {
    notFound();
  }

  const ensureCatalogMaterial = async (unit: string, description: string) => {
    const desc = description.trim();
    if (!desc) return;

    const exists = catalogMaterials.some((m) => normalize(m.description) === normalize(desc));
    if (exists) return;

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) throw userErr;
    if (!user) throw new Error('Devi essere autenticato per aggiungere un materiale');

    const { error } = await supabase
      .from('materials')
      .insert([{ user_id: user.id, unit: unit || 'PZ', description: desc }]);

    if (error) {
      // 23505 = unique_violation
      if (String((error as any).code || '') === '23505') return;
      throw error;
    }

    await refreshMaterials();
  };

  const handleSubmit = async (data: WorkReportFormValues) => {
    if (isSaving) return; // Evita doppio submit
    setIsSaving(true);
    
    const { status, ...workReportDataFields } = data;

    try {
      // 1) se ci sono materiali confermati come nuovi, aggiungili in anagrafica
      const confirmedNew = (data.materials || []).filter(
        (m: any) => m?.is_new && m?.description && String(m.description).trim().length > 0
      );

      for (const m of confirmedNew) {
        await ensureCatalogMaterial(String(m.unit || 'PZ'), String(m.description));
      }

      // 2) salva bolla (ripulisce campi interni non necessari)
      const cleanedMaterials = (data.materials || []).map((m: any) => ({
        unit: m.unit,
        quantity: m.quantity,
        description: m.description,
      }));

      await updateInterventionRequest({
        ...intervention,
        work_report_data: { ...workReportDataFields, materials: cleanedMaterials },
        status: status,
      });

      toast.success('Bolla salvata');
      router.push('/interventions');
    } catch (e: any) {
      toast.error(e?.message || 'Errore durante il salvataggio della bolla');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container-custom py-6 sm:py-8 space-y-6">
      <div className="ds-card">
        <h1 className="mb-2">Bolla di Consegna</h1>
        <p className="text-muted-foreground">
          Intervento per: <span className="font-semibold text-foreground">{intervention.client_company_name}</span> • {intervention.system_type}{' '}
          {intervention.brand} {intervention.model}
        </p>
      </div>

      <div className="ds-card">
        <WorkReportForm
          initialData={{ ...(intervention.work_report_data ?? {}), id: intervention.id } as any}
          onSubmit={handleSubmit}
          clientName={intervention.client_company_name}
          clientEmail={intervention.client_email}
          currentStatus={intervention.status}
        />
      </div>
      <Toaster />
    </div>
  );
}