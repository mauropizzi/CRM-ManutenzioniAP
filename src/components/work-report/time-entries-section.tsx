"use client";

import { useEffect } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { PlusCircle } from 'lucide-react';
import { TimeEntryRow } from './time-entry-row';
import { calculateHours } from '@/lib/time-utils'; // Importa calculateHours
import { WorkReportFormValues } from '@/components/work-report-form';

export const TimeEntriesSection = () => {
  const { control, watch, setValue, getValues } = useFormContext<WorkReportFormValues>();
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "time_entries",
  });

  const timeEntries = watch("time_entries");
  const totalHours = timeEntries?.reduce((sum, entry) => sum + (entry.total_hours || 0), 0) || 0;

  // Rimosso il useEffect di calcolo delle ore, ora gestito in TimeEntryRow

  const handleAddEntry = () => {
    append({
      date: new Date(),
      technician: '',
      time_slot_1_start: '',
      time_slot_1_end: '',
      time_slot_2_start: '',
      time_slot_2_end: '',
      total_hours: 0,
    });
  };

  return (
    <div className="space-y-4 rounded-lg border p-6 bg-white dark:bg-gray-900">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Ore di lavoro (uomo/ora)
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Aggiungi una riga per tecnico e per giorno. Le ore si calcolano da Inizio/Fine su 1 o 2 fasce (es. pausa pranzo).
        </p>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <TimeEntryRow
            key={field.id}
            index={index}
            onRemove={() => remove(index)}
            canRemove={fields.length > 1}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleAddEntry}
        className="flex items-center gap-2"
      >
        <PlusCircle size={16} />
        + Riga ore
      </Button>

      <div className="flex flex-wrap items-center justify-end gap-6 pt-4 border-t">
        <div className="text-lg font-semibold">
          Totale ore: {totalHours.toFixed(2)}
        </div>

        <FormField
          control={control}
          name="kilometers"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormLabel className="text-sm">Km (opz.)</FormLabel>
              <FormControl>
                <Input type="number" className="w-24" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};