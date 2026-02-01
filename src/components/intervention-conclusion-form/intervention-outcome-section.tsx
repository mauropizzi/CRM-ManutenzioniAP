"use client";

import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { InterventionConclusionFormValues } from '../intervention-conclusion-form'; // Importo i tipi dal componente principale

export const InterventionOutcomeSection = () => {
  const { control } = useFormContext<InterventionConclusionFormValues>();

  return (
    <div className="grid gap-6 rounded-lg border p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Esito tecnico (non in bolla)</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">Queste informazioni restano interne e non vengono stampate nella bolla.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="intervention_concluded"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="rounded-sm data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=checked]:bg-blue-500 dark:data-[state=unchecked]:bg-gray-700"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-gray-700 dark:text-gray-300">Intervento concluso</FormLabel>
                <FormDescription className="text-gray-600 dark:text-gray-400">
                  Spunta quando l'intervento è terminato.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="request_quote"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="rounded-sm data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=checked]:bg-blue-500 dark:data-[state=unchecked]:bg-gray-700"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-gray-700 dark:text-gray-300">Richiede preventivo</FormLabel>
                <FormDescription className="text-gray-600 dark:text-gray-400">
                  Spunta se è necessario un preventivo.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};