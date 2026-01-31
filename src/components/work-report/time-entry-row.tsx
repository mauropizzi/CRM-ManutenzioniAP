"use client";

import { useEffect } from 'react'; // Importo useEffect
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Trash2, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { WorkReportFormValues } from '@/components/work-report-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { timeOptions, calculateHours } from '@/lib/time-utils'; // Importa calculateHours

interface TimeEntryRowProps {
  index: number;
  onRemove: () => void;
  canRemove: boolean;
}

export const TimeEntryRow = ({ index, onRemove, canRemove }: TimeEntryRowProps) => {
  const { control, watch, setValue } = useFormContext<WorkReportFormValues>();

  // Watch per le fasce orarie di questa riga
  const timeSlot1Start = watch(`time_entries.${index}.time_slot_1_start`);
  const timeSlot1End = watch(`time_entries.${index}.time_slot_1_end`);
  const timeSlot2Start = watch(`time_entries.${index}.time_slot_2_start`);
  const timeSlot2End = watch(`time_entries.${index}.time_slot_2_end`);

  // Calcola le ore totali ogni volta che una fascia oraria cambia
  useEffect(() => {
    const calculated = calculateHours(
      timeSlot1Start,
      timeSlot1End,
      timeSlot2Start,
      timeSlot2End
    );
    setValue(`time_entries.${index}.total_hours`, calculated, { shouldValidate: false });
  }, [timeSlot1Start, timeSlot1End, timeSlot2Start, timeSlot2End, index, setValue]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
      <div className="md:col-span-2">
        <FormField
          control={control}
          name={`time_entries.${index}.date`}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-xs">Data</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy")
                      ) : (
                        <span>gg/mm/aaaa</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />
      </div>

      <div className="md:col-span-2">
        <FormField
          control={control}
          name={`time_entries.${index}.technician`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Tecnico</FormLabel>
              <FormControl>
                <Input placeholder="Nome tecnico" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="md:col-span-3 grid grid-cols-2 gap-2">
        <FormField
          control={control}
          name={`time_entries.${index}.time_slot_1_start`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Fascia 1 Inizio</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="--:--" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`time_entries.${index}.time_slot_1_end`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Fascia 1 Fine</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="--:--" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>

      <div className="md:col-span-3 grid grid-cols-2 gap-2">
        <FormField
          control={control}
          name={`time_entries.${index}.time_slot_2_start`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Fascia 2 Inizio (opz.)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="--:--" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`time_entries.${index}.time_slot_2_end`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Fascia 2 Fine (opz.)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="--:--" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>

      <div className="md:col-span-1">
        <FormField
          control={control}
          name={`time_entries.${index}.total_hours`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Ore</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" disabled {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="md:col-span-1">
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