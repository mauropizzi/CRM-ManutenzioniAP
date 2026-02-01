"use client";

import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { InterventionRequest } from '@/types/intervention';
import { InterventionOutcomeSection } from './intervention-outcome-section'; // Importazione diretta

// Definisco lo schema e i tipi qui per evitare dipendenze circolari
export const interventionConclusionFormSchema = z.object({
  intervention_concluded: z.boolean().optional(),
  request_quote: z.boolean().optional(),
  office_notes: z.string().optional().or(z.literal('')),
});

export type InterventionConclusionFormValues = z.infer<typeof interventionConclusionFormSchema>;

interface InterventionConclusionFormProps {
  initialData?: InterventionRequest;
  onSubmit: (data: InterventionConclusionFormValues) => void;
}

export const InterventionConclusionForm = ({ initialData, onSubmit }: InterventionConclusionFormProps) => {
  const methods = useForm<InterventionConclusionFormValues>({
    resolver: zodResolver(interventionConclusionFormSchema),
    defaultValues: {
      intervention_concluded: initialData?.intervention_concluded ?? false,
      request_quote: initialData?.request_quote ?? false,
      office_notes: initialData?.office_notes ?? '',
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
          {/* Sezione Note Ufficio */}
          <div className="grid gap-6 rounded-lg border p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Note Ufficio</h3>
            <FormField
              control={methods.control}
              name="office_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Note Ufficio (opz.)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Aggiungi note per l'ufficio..." {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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