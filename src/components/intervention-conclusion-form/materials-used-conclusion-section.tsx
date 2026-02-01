"use client";

import React from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import { InterventionConclusionFormValues } from '@/components/intervention-conclusion-form';
import { UNITS } from '@/types/material'; // Importo UNITS dal tipo Materiale

export const MaterialsUsedConclusionSection = () => {
  const { control } = useFormContext<InterventionConclusionFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "materials_used",
  });

  return (
    <div className="grid gap-6 rounded-lg border p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Ricambi / Materiali utilizzati</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">Default 6 righe. Puoi aggiungerne altre.</p>

      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end border-t border-gray-200 dark:border-gray-700 pt-4">
          <FormField
            control={control}
            name={`materials_used.${index}.unit`}
            render={({ field }) => (
              <FormItem className="col-span-full sm:col-span-1">
                <FormLabel className="text-gray-700 dark:text-gray-300">U.M.</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Seleziona U.M." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-md border-gray-300 bg-white dark:bg-gray-900">
                    {UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`materials_used.${index}.quantity`}
            render={({ field }) => (
              <FormItem className="col-span-full sm:col-span-1">
                <FormLabel className="text-gray-700 dark:text-gray-300">Quantità</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="0" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`materials_used.${index}.description`}
            render={({ field }) => (
              <FormItem className="col-span-full sm:col-span-1">
                <FormLabel className="text-gray-700 dark:text-gray-300">Descrizione materiale</FormLabel>
                <FormControl>
                  <Input placeholder="Descrizione" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
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
        onClick={() => append({ unit: 'PZ', quantity: 0, description: '' })}
        className="rounded-md bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center gap-2 self-start"
      >
        <PlusCircle size={18} /> Aggiungi riga materiale
      </Button>
    </div>
  );
};