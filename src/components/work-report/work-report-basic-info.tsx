"use client";

import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Printer } from 'lucide-react';
import { WorkReportFormValues } from '@/components/work-report-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link'; // Importa Link

interface WorkReportBasicInfoProps {
  clientName?: string;
  interventionId?: string; // Aggiungo interventionId come prop
}

export const WorkReportBasicInfo = ({ clientName, interventionId }: WorkReportBasicInfoProps) => {
  const { control, getValues } = useFormContext<WorkReportFormValues>(); // Destruttura getValues qui

  return (
    <div className="space-y-4 rounded-lg border p-6 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Bolla di lavoro (operativo)
        </h3>
        {clientName && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Cliente: {clientName}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <FormField
          control={control}
          name="client_absent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-medium">
                  Cliente assente (firma non raccolta)
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        {/* Pulsante Stampa Bolla */}
        {interventionId && (
          <Link 
            href={`/interventions/${interventionId}/print-work-report`} 
            className="ml-auto flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Printer size={16} />
            Stampa bolla
          </Link>
        )}

        <Select onValueChange={(value) => control.setValue('status', value as any)} defaultValue={getValues('status')} className="ml-auto">
          <FormControl>
            <SelectTrigger className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Seleziona stato" />
            </SelectTrigger>
          </FormControl>
          <SelectContent className="rounded-md border-gray-300 bg-white dark:bg-gray-900">
            <SelectItem value="Da fare">Da fare</SelectItem>
            <SelectItem value="In corso">In corso</SelectItem>
            <SelectItem value="Completato">Completato</SelectItem>
            <SelectItem value="Annullato">Annullato</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="work_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrizione lavori svolti</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrivi l'intervento..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="operative_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note operative (opz.)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Es. misure, pressioni, anomalie..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};