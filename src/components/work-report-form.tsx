import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { WorkReportBasicInfo, TimeEntriesSection, MaterialsSection } from './work-report';

const timeEntrySchema = z.object({
  date: z.date({ required_error: "Seleziona una data." }),
  technician: z.string().min(1, { message: "Inserisci il nome del tecnico." }),
  time_slot_1_start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato HH:MM" }),
  time_slot_1_end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato HH:MM" }),
  time_slot_2_start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato HH:MM" }).optional().or(z.literal('')),
  time_slot_2_end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato HH:MM" }).optional().or(z.literal('')),
  total_hours: z.number().min(0),
});

const materialSchema = z.object({
  unit: z.string().optional().or(z.literal('')),
  quantity: z.coerce.number().min(0, { message: "Quantità non valida." }),
  description: z.string().optional().or(z.literal('')),
});

export const workReportSchema = z.object({
  id: z.string().optional(),
  client_absent: z.boolean(),
  work_description: z.string().min(10, { message: "Descrivi i lavori svolti (min. 10 caratteri)." }),
  operative_notes: z.string().optional(),
  time_entries: z.array(timeEntrySchema).optional(),
  kilometers: z.coerce.number().min(0).optional(),
  materials: z.array(materialSchema).optional(),
  status: z.enum(['Da fare', 'In corso', 'Completato', 'Annullato']),
});

export type WorkReportFormValues = z.infer<typeof workReportSchema>;

interface WorkReportFormProps {
  initialData?: Partial<WorkReportFormValues>;
  onSubmit: (data: WorkReportFormValues) => void;
  clientName?: string;
  currentStatus: 'Da fare' | 'In corso' | 'Completato' | 'Annullato';
}

const DEFAULT_TIME_ENTRY = {
  date: new Date(),
  technician: '',
  time_slot_1_start: '',
  time_slot_1_end: '',
  time_slot_2_start: '',
  time_slot_2_end: '',
  total_hours: 0,
};

const DEFAULT_MATERIAL = { unit: 'PZ', quantity: 0, description: '' };

export const WorkReportForm = ({ initialData, onSubmit, clientName, currentStatus }: WorkReportFormProps) => {
  const methods = useForm<WorkReportFormValues>({
    resolver: zodResolver(workReportSchema),
    defaultValues: {
      id: initialData?.id ?? undefined,
      client_absent: initialData?.client_absent ?? false,
      work_description: initialData?.work_description ?? '',
      operative_notes: initialData?.operative_notes ?? '',
      time_entries: initialData?.time_entries?.length
        ? initialData.time_entries
        : [DEFAULT_TIME_ENTRY],
      kilometers: initialData?.kilometers ?? 0,
      materials: initialData?.materials?.length
        ? initialData.materials
        : Array(6).fill(null).map(() => ({ ...DEFAULT_MATERIAL })), // Assicura oggetti unici
      status: initialData?.status ?? currentStatus,
    } as WorkReportFormValues,
  });

  const handleSubmit = (values: WorkReportFormValues) => {
    const filteredMaterials = values.materials?.filter(material => material.description && material.description.trim() !== '') || [];
    onSubmit({ ...values, materials: filteredMaterials });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-8">
        <WorkReportBasicInfo clientName={clientName} interventionId={initialData?.id} />
        <TimeEntriesSection />
        <MaterialsSection />

        <div className="flex justify-end gap-4 pt-4">
          <Link href="/interventions" passHref>
            <Button type="button" variant="outline">Annulla</Button>
          </Link>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Salva Bolla
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};