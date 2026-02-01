"use client";

import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormMessage,
} from '@/components/ui/form';
import Link from 'next/link';
import { InterventionRequest } from '@/types/intervention';
import { calculateHours } from '@/lib/time-utils';
import {
  InterventionOutcomeSection,
  WorkReportDetailsSection,
  TimeEntriesConclusionSection,
  MaterialsUsedConclusionSection,
} from './intervention-conclusion-form'; // Importo i nuovi componenti

// Schemi Zod per le sottosezioni
const timeEntrySchema = z.object({
  date: z.date({ required_error: "Seleziona una data." }),
  technician: z.string().min(2, { message: "Inserisci il nome del tecnico." }),
  time_slot_1_start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato ora non valido (HH:MM)." }),
  time_slot_1_end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato ora non valido (HH:MM)." }),
  time_slot_2_start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato ora non valido (HH:MM)." }).optional().or(z.literal('')),
  time_slot_2_end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato ora non valido (HH:MM)." }).optional().or(z.literal('')),
  total_hours: z.number().min(0),
}).refine(data => {
  const hours = calculateHours(data.time_slot_1_start, data.time_slot_1_end, data.time_slot_2_start, data.time_slot_2_end);
  return hours > 0 || (data.time_slot_1_start === '' && data.time_slot_1_end === '' && data.time_slot_2_start === '' && data.time_slot_2_end === '');
}, {
  message: "Le ore di lavoro devono essere maggiori di zero se inserite.",
  path: ["total_hours"],
});

const materialUsedSchema = z.object({
  unit: z.string().optional(), // Reso opzionale
  quantity: z.coerce.number().min(0, { message: "La quantità non può essere negativa." }).default(0), // Default a 0, ma opzionale
  description: z.string().optional(), // Reso opzionale
});

export const interventionConclusionFormSchema = z.object({
  intervention_concluded: z.boolean().optional(),
  request_quote: z.boolean().optional(),
  client_absent: z.boolean().optional(),
  work_description: z.string().min(10, { message: "Descrivi i lavori svolti (almeno 10 caratteri)." }).optional(),
  operative_notes_conclusion: z.string().optional(),
  time_entries: z.array(timeEntrySchema).optional(),
  kilometers: z.coerce.number().min(0, { message: "I Km non possono essere negativi." }).optional(),
  materials_used: z.array(materialUsedSchema).optional().transform((materials) => {
    // Filtra i materiali che hanno una descrizione vuota o solo spazi bianchi
    return materials?.filter(material => material.description && material.description.trim() !== '') || [];
  }),
});

export type InterventionConclusionFormValues = z.infer<typeof interventionConclusionFormSchema>;

interface InterventionConclusionFormProps {
  initialData?: InterventionRequest;
  onSubmit: (data: InterventionConclusionFormValues) => void;
}

const DEFAULT_TIME_ENTRY = { date: new Date(), technician: '', time_slot_1_start: '', time_slot_1_end: '', time_slot_2_start: '', time_slot_2_end: '', total_hours: 0 };
const DEFAULT_MATERIAL = { unit: 'PZ', quantity: 0, description: '' };

export const InterventionConclusionForm = ({ initialData, onSubmit }: InterventionConclusionFormProps) => {
  const methods = useForm<InterventionConclusionFormValues>({
    resolver: zodResolver(interventionConclusionFormSchema),
    defaultValues: {
      intervention_concluded: initialData?.intervention_concluded ?? false,
      request_quote: initialData?.request_quote ?? false,
      client_absent: initialData?.client_absent ?? false,
      work_description: initialData?.work_description ?? '',
      operative_notes_conclusion: initialData?.operative_notes_conclusion ?? '',
      time_entries: initialData?.time_entries?.map(entry => ({
        ...entry,
        date: new Date(entry.date),
      })) ?? [DEFAULT_TIME_ENTRY], // Assicurati che ci sia almeno una riga di default
      kilometers: initialData?.kilometers ?? 0,
      materials_used: initialData?.materials_used?.length
        ? initialData.materials_used
        : Array(6).fill(DEFAULT_MATERIAL), // 6 righe di default
    },
  });

  const handleSubmit = (values: InterventionConclusionFormValues) => {
    onSubmit(values);
  };

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-8 p-4">
          <InterventionOutcomeSection />
          <WorkReportDetailsSection />
          <TimeEntriesConclusionSection />
          <MaterialsUsedConclusionSection />

          <div className="flex justify-end gap-2 pt-4">
            <Link href="/interventions" passHref>
              <Button type="button" variant="outline" className="rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                Annulla
              </Button>
            </Link>
            <Button type="submit" className="rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2">
              Salva Conclusione
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
};