import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { WorkReportBasicInfo, TimeEntriesSection, MaterialsSection } from './work-report';
import { calculateHours } from '@/lib/time-utils';
import type { Resolver, SubmitHandler } from 'react-hook-form';

const timeEntrySchema = z.object({
  date: z.date({ required_error: "Seleziona una data." }),
  resource_type: z.enum(['technician', 'supplier']).default('technician'),
  technician: z.string().min(1, { message: "Seleziona un tecnico/fornitore." }),
  time_slot_1_start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato HH:MM" }),
  time_slot_1_end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato HH:MM" }),
  time_slot_2_start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato HH:MM" }).optional().or(z.literal('')),
  time_slot_2_end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato HH:MM" }).optional().or(z.literal('')),
  total_hours: z.number().min(0),
});

const materialSchema = z.object({
  unit: z.string().optional().or(z.literal('')),
  quantity: z.coerce.number().min(0, { message: "Quantità non valida." }).default(0),
  description: z.string().optional().or(z.literal('')),
  material_id: z.string().optional().or(z.literal('')),
  is_new: z.boolean().optional(),
});

export const workReportSchema = z.object({
  id: z.string().optional(),
  client_absent: z.boolean(),
  work_description: z.string().min(10, { message: "Descrivi i lavori svolti (min. 10 caratteri)." }),
  operative_notes: z.string().optional(),
  time_entries: z.array(timeEntrySchema).default([]),
  kilometers: z.coerce.number().min(0).optional(),
  materials: z
    .array(materialSchema)
    .default([])
    .transform((materials) =>
      materials.filter((material) => material.description && material.description.trim() !== '')
    ),
  status: z.enum(['Da fare', 'In corso', 'Completato', 'Annullato']),
});

export type WorkReportFormValues = z.infer<typeof workReportSchema>;

interface WorkReportFormProps {
  initialData?: Partial<WorkReportFormValues>;
  onSubmit: (data: WorkReportFormValues) => Promise<void> | void;
  clientName?: string;
  clientEmail?: string;
  currentStatus: 'Da fare' | 'In corso' | 'Completato' | 'Annullato';
}

const DEFAULT_TIME_ENTRY = {
  date: new Date(),
  resource_type: 'technician' as const,
  technician: '',
  time_slot_1_start: '',
  time_slot_1_end: '',
  time_slot_2_start: '',
  time_slot_2_end: '',
  total_hours: 0,
};

const DEFAULT_MATERIAL = { unit: 'PZ', quantity: 0, description: '', material_id: '', is_new: undefined };

export const WorkReportForm = ({ initialData, onSubmit, clientName, clientEmail, currentStatus }: WorkReportFormProps) => {
  const normalizedTimeEntries = initialData?.time_entries?.length
    ? initialData.time_entries.map((e) => ({
        ...e,
        resource_type: (e as any).resource_type ?? 'technician',
      }))
    : [DEFAULT_TIME_ENTRY];

  const normalizedMaterials = initialData?.materials?.length
    ? initialData.materials.map((m) => ({
        material_id: (m as any).material_id ?? '',
        is_new: (m as any).is_new ?? undefined,
        ...m,
      }))
    : Array(6).fill(DEFAULT_MATERIAL);

  const methods = useForm<WorkReportFormValues>({
    resolver: zodResolver(workReportSchema) as Resolver<WorkReportFormValues>,
    defaultValues: {
      id: initialData?.id ?? undefined,
      client_absent: initialData?.client_absent ?? false,
      work_description: initialData?.work_description ?? '',
      operative_notes: initialData?.operative_notes ?? '',
      time_entries: normalizedTimeEntries as any,
      kilometers: initialData?.kilometers ?? 0,
      materials: normalizedMaterials as any,
      status: initialData?.status ?? currentStatus,
    } as WorkReportFormValues,
  });

  const handleSubmit: SubmitHandler<WorkReportFormValues> = async (values) => {
    await onSubmit(values);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-8">
        <WorkReportBasicInfo clientName={clientName} clientEmail={clientEmail} interventionId={initialData?.id} />
        <TimeEntriesSection />
        <MaterialsSection />
        <div className="flex justify-end gap-4 pt-4">
          <Link href="/interventions" passHref>
            <Button type="button" variant="outline">Annulla</Button>
          </Link>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={methods.formState.isSubmitting}>
            {methods.formState.isSubmitting ? 'Salvataggio…' : 'Salva Bolla'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

// Re-export per backward compatibility
export { calculateHours };