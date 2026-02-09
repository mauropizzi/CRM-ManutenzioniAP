"use client";

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSystemTypes } from '@/context/system-type-context';
import { useBrands } from '@/context/brand-context';
import { InterventionFormValues } from '@/components/intervention-form';

export const SystemDetailsSection = () => {
  const { control } = useFormContext<InterventionFormValues>();
  const { systemTypes, loading: systemTypesLoading } = useSystemTypes();
  const { brands, loading: brandsLoading } = useBrands();

  return (
    <div className="grid gap-6 rounded-lg border p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Impianto / Modello macchina</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="system_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Tipo impianto *</FormLabel>
              <Select
                value={field.value || ''}
                onValueChange={(val) => field.onChange(val)}
              >
                <FormControl>
                  <SelectTrigger className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Seleziona tipo impianto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-md border-gray-300 bg-white dark:bg-gray-900">
                  {systemTypesLoading ? (
                    <SelectItem value="__loading__" disabled>
                      Caricamento...
                    </SelectItem>
                  ) : (
                    systemTypes.map((t) => (
                      <SelectItem key={t.id} value={t.name}>
                        {t.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Marca *</FormLabel>
              <Select value={field.value || ''} onValueChange={(val) => field.onChange(val)}>
                <FormControl>
                  <SelectTrigger className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Seleziona marca" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-md border-gray-300 bg-white dark:bg-gray-900">
                  {brandsLoading ? (
                    <SelectItem value="__loading__" disabled>
                      Caricamento...
                    </SelectItem>
                  ) : (
                    brands.map((b) => (
                      <SelectItem key={b.id} value={b.name}>
                        {b.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Modello *</FormLabel>
              <FormControl>
                <Input placeholder="Modello" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="serial_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Matricola *</FormLabel>
              <FormControl>
                <Input placeholder="Matricola" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="system_location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Ubicazione impianto *</FormLabel>
              <FormControl>
                <Input placeholder="Ubicazione impianto" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="internal_ref"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Rif. interno (opz.)</FormLabel>
              <FormControl>
                <Input placeholder="Riferimento interno" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};