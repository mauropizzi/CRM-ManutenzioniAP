"use client";

import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { InterventionConclusionFormValues } from '@/components/intervention-conclusion-form';

export const WorkReportDetailsSection = () => {
  const { control } = useFormContext<InterventionConclusionFormValues>();

  return (
    <div className="grid gap-6 rounded-lg border p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Bolla di lavoro (operativo)</h3>
      <div className="flex justify-between items-center">
        <FormField
          control={control}
          name="client_absent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="rounded-sm data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=checked]:bg-blue-500 dark:data-[state=unchecked]:bg-gray-700"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-gray-700 dark:text-gray-300">Cliente assente (firma non raccolta)</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <Button variant="outline" className="rounded-md px-4 py-2 flex items-center gap-2">
          <Printer size={18} /> Stampa bolla
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="work_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Descrizione lavori svolti</FormLabel>
              <FormControl>
                <Textarea placeholder="Descrivi l'intervento..." {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[120px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="operative_notes_conclusion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Note operative (opz.)</FormLabel>
              <FormControl>
                <Textarea placeholder="Es. misure, pressioni, anomalie..." {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[120px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};