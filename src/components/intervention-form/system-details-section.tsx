"use client";

import React, { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Combobox } from '@/components/combobox';
import { fetchSystemTypes, fetchBrands, upsertSystemTypeByName, upsertBrandByName } from '@/lib/catalog-utils';

export const SystemDetailsSection = () => {
  const { control, setValue, watch } = useFormContext<any>();
  const [typeValue, setTypeValue] = useState<{ id?: string; name: string } | null>(null);
  const [brandValue, setBrandValue] = useState<{ id?: string; name: string } | null>(null);

  const handleTypeChange = useCallback((val: { id?: string; name: string } | null) => {
    setTypeValue(val);
    setValue('system_type', val?.name || '');
  }, [setValue]);

  const handleBrandChange = useCallback((val: { id?: string; name: string } | null) => {
    setBrandValue(val);
    setValue('brand', val?.name || '');
  }, [setValue]);

  return (
    <div className="grid gap-6 rounded-lg border p-4 shadow-sm">
      <h3 className="text-lg font-semibold">Dati impianto</h3>

      <FormField
        control={control}
        name="system_type"
        render={() => (
          <FormItem>
            <FormLabel>Tipo impianto</FormLabel>
            <FormControl>
              <Combobox
                placeholder="Seleziona o crea un tipo impianto"
                value={typeValue}
                onChange={handleTypeChange}
                fetchItems={async () => {
                  const items = await fetchSystemTypes();
                  return items.map(i => ({ id: i.id, name: i.name }));
                }}
                createItem={async (name: string) => {
                  const created = await upsertSystemTypeByName(name);
                  return { id: created.id, name: created.name };
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="brand"
        render={() => (
          <FormItem>
            <FormLabel>Marca</FormLabel>
            <FormControl>
              <Combobox
                placeholder="Seleziona o crea una marca"
                value={brandValue}
                onChange={handleBrandChange}
                fetchItems={async () => {
                  const items = await fetchBrands();
                  return items.map(i => ({ id: i.id, name: i.name }));
                }}
                createItem={async (name: string) => {
                  const created = await upsertBrandByName(name);
                  return { id: created.id, name: created.name };
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};