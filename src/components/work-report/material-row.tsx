"use client";

import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { WorkReportFormValues } from '@/components/work-report-form';
import { MaterialSearchInput } from './material-search-input'; // Import the new component
import { UNITS } from '@/types/material'; // Import UNITS from material types

interface MaterialRowProps {
  index: number;
  onRemove: () => void;
  canRemove: boolean;
}

export const MaterialRow = ({ index, onRemove, canRemove }: MaterialRowProps) => {
  const { control } = useFormContext<WorkReportFormValues>();

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
      <div className="md:col-span-2">
        <FormField
          control={control}
          name={`materials.${index}.unit`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={`text-xs ${index > 0 ? 'sr-only' : ''}`}>
                U.M.
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger ref={field.ref}> {/* Pass field.ref here */}
                    <SelectValue placeholder="U.M." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>

      <div className="md:col-span-2">
        <FormField
          control={control}
          name={`materials.${index}.quantity`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={`text-xs ${index > 0 ? 'sr-only' : ''}`}>
                Quantità
              </FormLabel>
              <FormControl>
                <Input type="number" min="0" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="md:col-span-7">
        <FormField
          control={control}
          name={`materials.${index}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={`text-xs ${index > 0 ? 'sr-only' : ''}`}>
                Descrizione materiale
              </FormLabel>
              <FormControl>
                <MaterialSearchInput index={index} field={field} /> {/* Use the new component */}
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="md:col-span-1 flex justify-end">
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={18} />
          </Button>
        )}
      </div>
    </div>
  );
};