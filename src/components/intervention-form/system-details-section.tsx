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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SystemDetailsSection = () => {
  const { control } = useFormContext<InterventionFormValues>();
  const { systemTypes, loading: systemTypesLoading } = useSystemTypes();
  const { brands, loading: brandsLoading } = useBrands();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Dettagli Impianto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="system_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo impianto *</FormLabel>
                <Select
                  value={field.value || ''}
                  onValueChange={(val) => field.onChange(val)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona tipo impianto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
                <FormLabel>Marca *</FormLabel>
                <Select value={field.value || ''} onValueChange={(val) => field.onChange(val)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona marca" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="serial_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matricola *</FormLabel>
                <FormControl>
                  <Input placeholder="Matricola" {...field} />
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
                <FormLabel>Ubicazione impianto *</FormLabel>
                <FormControl>
                  <Input placeholder="Ubicazione impianto" {...field} />
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
                <FormLabel>Rif. interno (opz.)</FormLabel>
                <FormControl>
                  <Input placeholder="Riferimento interno" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};