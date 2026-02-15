"use client";

import { useFormContext, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { PlusCircle, Timer } from 'lucide-react';
import { TimeEntryRow } from './time-entry-row';
import { WorkReportFormValues } from '@/components/work-report-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const TimeEntriesSection = () => {
  const { control, watch } = useFormContext<WorkReportFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'time_entries',
  });

  const timeEntries = watch('time_entries');
  const totalHours = timeEntries?.reduce((sum, entry) => sum + (entry.total_hours || 0), 0) || 0;

  const handleAddEntry = () => {
    append({
      date: new Date(),
      resource_type: 'technician',
      technician: '',
      time_slot_1_start: '',
      time_slot_1_end: '',
      time_slot_2_start: '',
      time_slot_2_end: '',
      total_hours: 0,
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-success/10 flex items-center justify-center">
              <Timer className="h-5 w-5 text-success" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Ore di lavoro (uomo/ora)</CardTitle>
              <p className="text-sm text-text-secondary mt-0.5">
                Aggiungi una riga per risorsa e per giorno. Le ore si calcolano da Inizio/Fine su 1 o 2 fasce.
              </p>
            </div>
          </div>

          <Button type="button" variant="outline" onClick={handleAddEntry} className="gap-2 rounded-xl">
            <PlusCircle size={16} />
            + Riga ore
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
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

        <div className="flex flex-wrap items-center justify-end gap-6 pt-5 mt-5 border-t">
          <div className="text-base sm:text-lg font-semibold">
            Totale ore: {totalHours.toFixed(2)}
          </div>

          <FormField
            control={control}
            name="kilometers"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormLabel className="text-sm">Km (opz.)</FormLabel>
                <FormControl>
                  <Input type="number" className="w-28 rounded-xl" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};