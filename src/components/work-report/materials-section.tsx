"use client";

import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { MaterialRow } from './material-row';
import { WorkReportFormValues } from '@/components/work-report-form';

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
    <div className="space-y-4 rounded-lg border p-6 bg-white dark:bg-gray-900">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Ricambi / Materiali utilizzati
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Default 6 righe. Puoi aggiungerne altre.
        </p>
      </div>

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

      <Button
        type="button"
        variant="outline"
        onClick={handleAddMaterial}
        className="flex items-center gap-2"
      >
        <PlusCircle size={16} />
        + Riga
      </Button>
    </div>
  );
};