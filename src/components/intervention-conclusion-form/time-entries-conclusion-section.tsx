"use client";

import React, { useEffect } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateHours, generateTimeOptions } from '@/lib/time-utils';
import { InterventionConclusionFormValues } from '@/components/intervention-conclusion-form';

const timeOptions = generateTimeOptions();

export const TimeEntriesConclusionSection = () => {
  const { control, watch, setValue, getValues } = useFormContext<InterventionConclusionFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "time_entries",
  });

  // Calculate total hours dynamically
  const totalHours = watch("time_entries")?.reduce((sum, entry) => sum + (entry.total_hours || 0), 0) || 0;

  useEffect(() => {
    // Update total_hours for each time entry when time slots change
    fields.forEach((field, index) => {
      const start1 = getValues(`time_entries.${index}.time_slot_1_start`);
      const end1 = getValues(`time_entries.${index}.time_slot_1_end`);
      const start2 = getValues(`time_entries.${index}.time_slot_2_start`);
      const end2 = getValues(`time_entries.${index}.time_slot_2_end`);
      const calculated = calculateHours(start1, end1, start2, end2);
      if (calculated !== field.total_hours) {
        setValue(`time_entries.${index}.total_hours`, calculated, { shouldValidate: true });
      }
    });
  }, [watch("time_entries"), fields, getValues, setValue]);

  return (
    <div className="grid gap-6 rounded-lg border p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Ore di lavoro (uomo/ora)</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">Aggiungi una riga per tecnico e per giorno. Le ore si calcolano da Inizio/Fine su 1 o 2 fasce (es. pausa pranzo).</p>

      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-end border-t border-gray-200 dark:border-gray-700 pt-4">
          <FormField
            control={control}
            name={`time_entries.${index}.date`}
            render={({ field: dateField }) => (
              <FormItem className="flex flex-col col-span-full sm:col-span-1">
                <FormLabel className="text-gray-700 dark:text-gray-300">Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                          !dateField.value && "text-muted-foreground"
                        )}
                      >
                        {dateField.value ? (
                          format(dateField.value, "dd/MM/yyyy")
                        ) : (
                          <span>gg / mm / aaaa</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateField.value}
                      onSelect={dateField.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`time_entries.${index}.technician`}
            render={({ field }) => (
              <FormItem className="col-span-full sm:col-span-1">
                <FormLabel className="text-gray-700 dark:text-gray-300">Tecnico</FormLabel>
                <FormControl>
                  <Input placeholder="Nome tecnico" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="col-span-full sm:col-span-2 grid grid-cols-2 gap-2">
            <FormField
              control={control}
              name={`time_entries.${index}.time_slot_1_start`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Fascia 1 Inizio</FormLabel>
                  <FormControl>
                    <Input placeholder="-- : --" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`time_entries.${index}.time_slot_1_end`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Fascia 1 Fine</FormLabel>
                  <FormControl>
                    <Input placeholder="-- : --" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`time_entries.${index}.time_slot_2_start`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Fascia 2 Inizio (opz.)</FormLabel>
                  <FormControl>
                    <Input placeholder="-- : --" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`time_entries.${index}.time_slot_2_end`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Fascia 2 Fine (opz.)</FormLabel>
                  <FormControl>
                    <Input placeholder="-- : --" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={control}
            name={`time_entries.${index}.total_hours`}
            render={({ field }) => (
              <FormItem className="col-span-full sm:col-span-1">
                <FormLabel className="text-gray-700 dark:text-gray-300">Ore</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} disabled className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
            className="rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700 col-span-full sm:col-span-auto"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        onClick={() => append({ date: new Date(), technician: '', time_slot_1_start: '', time_slot_1_end: '', time_slot_2_start: '', time_slot_2_end: '', total_hours: 0 })}
        className="rounded-md bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center gap-2 self-start"
      >
        <PlusCircle size={18} /> Aggiungi riga ore
      </Button>

      <div className="flex justify-end items-center gap-4 mt-4">
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Totale ore: {totalHours.toFixed(2)}</span>
        <FormField
          control={control}
          name="kilometers"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormLabel className="text-gray-700 dark:text-gray-300">Km (opz.)</FormLabel>
              <FormControl>
                <Input type="number" step="1" placeholder="0" {...field} className="w-24 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};