"use client";

import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { InterventionFormValues } from '@/components/intervention-form';
import { Button } from '@/components/ui/button';
import { useTechnicians } from '@/context/technician-context';
import { useSuppliers } from '@/context/supplier-context';
import type { Supplier } from '@/types/supplier';

interface SchedulingDetailsSectionProps {
  timeOptions: string[];
}

const NONE_VALUE = "__none__";

export const SchedulingDetailsSection = ({ timeOptions }: SchedulingDetailsSectionProps) => {
  const { control, watch, setValue } = useFormContext<InterventionFormValues>();
  const { technicians, loading: techniciansLoading } = useTechnicians();
  const { suppliers, loading: suppliersLoading } = useSuppliers();

  const assignedTechnician = watch('assigned_technicians');
  const assignedSupplier = watch('assigned_supplier');

  const isTechLocked = Boolean(assignedSupplier && assignedSupplier.trim().length > 0);
  const isSupplierLocked = Boolean(assignedTechnician && assignedTechnician.trim().length > 0);

  return (
    <div className="grid gap-6 rounded-lg border p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Programmazione / Dati intervento</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="scheduled_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-gray-700 dark:text-gray-300">Data programmata</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy", { locale: it })
                      ) : (
                        <span>gg / mm / aaaa</span>
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
                    locale={it}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="scheduled_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Ora programmata</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Seleziona ora" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-md border-gray-300 bg-white dark:bg-gray-900">
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Stato *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Seleziona stato" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-md border-gray-300 bg-white dark:bg-gray-900">
                  <SelectItem value="Da fare">Da fare</SelectItem>
                  <SelectItem value="In corso">In corso</SelectItem>
                  <SelectItem value="Completato">Completato</SelectItem>
                  <SelectItem value="Annullato">Annullato</SelectItem>
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
          name="assigned_technicians"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Assegna a tecnico (opz.)</FormLabel>
              <Select
                value={field.value && field.value.trim().length > 0 ? field.value : NONE_VALUE}
                onValueChange={(val) => {
                  const next = val === NONE_VALUE ? '' : val;
                  field.onChange(next);
                  if (next && next.trim().length > 0) setValue('assigned_supplier', '');
                }}
                disabled={isTechLocked}
              >
                <FormControl>
                  <SelectTrigger className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-60">
                    <SelectValue placeholder={isTechLocked ? 'Selezione bloccata (fornitore assegnato)' : 'Seleziona un tecnico'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-md border-gray-300 bg-white dark:bg-gray-900">
                  <SelectItem value={NONE_VALUE}>Nessuno</SelectItem>
                  {techniciansLoading ? (
                    <SelectItem value="loading" disabled>
                      Caricamento tecnici...
                    </SelectItem>
                  ) : (
                    technicians.map((technician) => (
                      <SelectItem key={technician.id} value={`${technician.first_name} ${technician.last_name}`}>
                        {`${technician.first_name} ${technician.last_name}`}
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
          name="assigned_supplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Assegna a fornitore (opz.)</FormLabel>
              <Select
                value={field.value && field.value.trim().length > 0 ? field.value : NONE_VALUE}
                onValueChange={(val) => {
                  const next = val === NONE_VALUE ? '' : val;
                  field.onChange(next);
                  if (next && next.trim().length > 0) setValue('assigned_technicians', '');
                }}
                disabled={isSupplierLocked}
              >
                <FormControl>
                  <SelectTrigger className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-60">
                    <SelectValue placeholder={isSupplierLocked ? 'Selezione bloccata (tecnico assegnato)' : 'Seleziona un fornitore'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-md border-gray-300 bg-white dark:bg-gray-900">
                  <SelectItem value={NONE_VALUE}>Nessuno</SelectItem>
                  {suppliersLoading ? (
                    <SelectItem value="loading" disabled>
                      Caricamento fornitori...
                    </SelectItem>
                  ) : (
                    (suppliers as Supplier[])
                      .filter((s: Supplier) => s.attivo !== false)
                      .map((s: Supplier) => (
                        <SelectItem key={s.id} value={s.ragione_sociale}>
                          {s.ragione_sociale}
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
          name="office_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Note ufficio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Es. urgenza, accesso, contatti..."
                  {...field}
                  className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};