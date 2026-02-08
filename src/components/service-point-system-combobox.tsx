"use client";

import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/combobox';
import { fetchSystemTypes, fetchBrands, upsertSystemTypeByName, upsertBrandByName } from '@/lib/catalog-utils';

interface SystemInput {
  system_type: string;
  brand: string;
}

export const ServicePointSystemCombobox = ({
  onAdd,
}: {
  onAdd: (system: SystemInput) => void;
}) => {
  const [typeValue, setTypeValue] = useState<{ id?: string; name: string } | null>(null);
  const [brandValue, setBrandValue] = useState<{ id?: string; name: string } | null>(null);

  const canAdd = Boolean(typeValue?.name && brandValue?.name);

  const handleAdd = useCallback(() => {
    if (!canAdd) return;
    onAdd({
      system_type: typeValue!.name,
      brand: brandValue!.name,
    });
    setTypeValue(null);
    setBrandValue(null);
  }, [canAdd, typeValue, brandValue, onAdd]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <Combobox
        placeholder="Tipo impianto"
        value={typeValue}
        onChange={setTypeValue}
        fetchItems={async () => {
          const items = await fetchSystemTypes();
          return items.map(i => ({ id: i.id, name: i.name }));
        }}
        createItem={async (name: string) => {
          const created = await upsertSystemTypeByName(name);
          return { id: created.id, name: created.name };
        }}
      />
      <Combobox
        placeholder="Marca"
        value={brandValue}
        onChange={setBrandValue}
        fetchItems={async () => {
          const items = await fetchBrands();
          return items.map(i => ({ id: i.id, name: i.name }));
        }}
        createItem={async (name: string) => {
          const created = await upsertBrandByName(name);
          return { id: created.id, name: created.name };
        }}
      />
      <Button onClick={handleAdd} disabled={!canAdd}>
        Aggiungi
      </Button>
    </div>
  );
};