"use client";

import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { PlusCircle, Package } from 'lucide-react';
import { MaterialRow } from './material-row';
import { WorkReportFormValues } from '@/components/work-report-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DEFAULT_MATERIALS_COUNT = 6;

export const MaterialsSection = () => {
  const { control } = useFormContext<WorkReportFormValues>();
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "materials",
  });

  const handleAddMaterial = () => {
    append({ unit: 'PZ', quantity: 0, description: '' });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Ricambi / Materiali utilizzati</CardTitle>
              <p className="text-sm text-text-secondary mt-0.5">
                Default 6 righe. Puoi aggiungerne altre.
              </p>
            </div>
          </div>

          <Button type="button" variant="outline" onClick={handleAddMaterial} className="gap-2 rounded-xl">
            <PlusCircle size={16} />
            + Riga
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2">
          {fields.map((field, index) => (
            <MaterialRow
              key={field.id}
              index={index}
              onRemove={() => remove(index)}
              canRemove={fields.length > DEFAULT_MATERIALS_COUNT}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};