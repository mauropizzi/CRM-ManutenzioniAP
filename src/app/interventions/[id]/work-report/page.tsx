"use client";

import React, { use, useMemo, useState } from 'react';
import { WorkReportForm, WorkReportFormValues } from '@/components/work-report-form';
import { useInterventionRequests } from '@/context/intervention-context';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useMaterials } from '@/context/material-context';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { FileText, Package, Timer, Route } from 'lucide-react';

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

  const stats = useMemo(() => {
    const timeEntries = intervention?.work_report_data?.time_entries ?? [];
    const hours = timeEntries.reduce((sum: number, e: any) => sum + (Number(e?.total_hours) || 0), 0);

    const materials = intervention?.work_report_data?.materials ?? [];
    const usedMaterials = materials.filter((m: any) => String(m?.description || '').trim().length > 0).length;

    const km = Number(intervention?.work_report_data?.kilometers ?? 0) || 0;

    return {
      hours,
      usedMaterials,
      km,
      status: intervention?.status ?? '—',
    };
  }, [intervention]);

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Bolla di Consegna</h2>
            </div>
            <p className="text-text-secondary text-sm mt-2">
              Intervento per: <span className="font-semibold text-foreground">{intervention.client_company_name}</span> —{' '}
              {intervention.system_type} {intervention.brand} {intervention.model}
            </p>
          </div>
        </div>

        {/* Stats Cards (stesso stile dei Materiali) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Stato</p>
                <p className="text-2xl font-bold text-foreground">{stats.status}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-info" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Totale ore</p>
                <p className="text-2xl font-bold text-foreground">{stats.hours.toFixed(2)}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Timer className="h-5 w-5 text-success" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Materiali inseriti</p>
                <p className="text-2xl font-bold text-foreground">{stats.usedMaterials}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Km</p>
                <p className="text-2xl font-bold text-foreground">{stats.km}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Route className="h-5 w-5 text-warning" />
              </div>
            </div>
          </Card>
        </div>

        {/* Form */}
        <Card className="overflow-hidden">
          <div className="p-4 sm:p-6">
            <WorkReportForm
              initialData={{ ...(intervention.work_report_data ?? {}), id: intervention.id } as any}
              onSubmit={handleSubmit}
              clientName={intervention.client_company_name}
              clientEmail={intervention.client_email}
              currentStatus={intervention.status}
            />
          </div>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}