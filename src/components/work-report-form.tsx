"use client";

import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusCircle, Trash2, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Helper per calcolare le ore dalle fasce orarie
const calculateHours = (start1: string, end1: string, start2?: string, end2?: string): number => {
  let totalMinutes = 0;

  const parseTime = (time: string) => {
    if (!time || !time.includes(':')) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  if (start1 && end1) {
    const s1 = parseTime(start1);
    const e1 = parseTime(end1);
    if (e1 > s1) totalMinutes += (e1 - s1);
  }

  if (start2 && end2) {
    const s2 = parseTime(start2);
    const e2 = parseTime(end2);
    if (e2 > s2) totalMinutes += (e2 - s2);
  }

  return totalMinutes / 60;
};

const timeEntrySchema = z.object({
  date: z.date({ required_error: "Seleziona una data." }),
  technician: z.string().min(1, { message: "Inserisci il nome del tecnico." }),
  time_slot_1_start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato HH:MM" }),
  time_slot_1_end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato HH:MM" }),
  time_slot_2_start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato HH:MM" }).optional().or(z.literal('')),
  time_slot_2_end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato HH:MM" }).optional().or(z.literal('')),
  total_hours: z.number().min(0),
});

const materialSchema = z.object({
  unit: z.string().min(1, { message: "Seleziona U.M." }),
  quantity: z.coerce.number().min(0, { message: "Quantità non valida." }),
  description: z.string().min(1, { message: "Inserisci descrizione." }),
});

export const workReportSchema = z.object({
  client_absent: z.boolean().default(false),
  work_description: z.string().min(10, { message: "Descrivi i lavori svolti (min. 10 caratteri)." }),
  operative_notes: z.string().optional(),
  time_entries: z.array(timeEntrySchema).min(1, { message: "Aggiungi almeno una riga ore." }),
  kilometers: z.coerce.number().min(0).optional(),
  materials: z.array(materialSchema).default([]),
});

export type WorkReportFormValues = z.infer<typeof workReportSchema>;

interface WorkReportFormProps {
  initialData?: Partial<WorkReportFormValues>;
  onSubmit: (data: WorkReportFormValues) => void;
  clientName?: string;
}

export const WorkReportForm = ({ initialData, onSubmit, clientName }: WorkReportFormProps) => {
  const form = useForm<WorkReportFormValues>({
    resolver: zodResolver(workReportSchema),
    defaultValues: {
      client_absent: initialData?.client_absent ?? false,
      work_description: initialData?.work_description ?? '',
      operative_notes: initialData?.operative_notes ?? '',
      time_entries: initialData?.time_entries?.length ? initialData.time_entries : [{ 
        date: new Date(), 
        technician: '', 
        time_slot_1_start: '', 
        time_slot_1_end: '', 
        time_slot_2_start: '', 
        time_slot_2_end: '', 
        total_hours: 0 
      }],
      kilometers: initialData?.kilometers ?? 0,
      materials: initialData?.materials?.length ? initialData.materials : Array(6).fill({ unit: 'PZ', quantity: 0, description: '' }),
    } as WorkReportFormValues,
  });

  const { fields: timeFields, append: appendTime, remove: removeTime } = useFieldArray({
    control: form.control,
    name: "time_entries",
  });

  const { fields: materialFields, append: appendMaterial, remove: removeMaterial } = useFieldArray({
    control: form.control,
    name: "materials",
  });

  // Calcolo automatico ore
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.includes('time_entries')) {
        timeFields.forEach((_, index) => {
          const start1 = form.getValues(`time_entries.${index}.time_slot_1_start`);
          const end1 = form.getValues(`time_entries.${index}.time_slot_1_end`);
          const start2 = form.getValues(`time_entries.${index}.time_slot_2_start`);
          const end2 = form.getValues(`time_entries.${index}.time_slot_2_end`);
          const calculated = calculateHours(start1, end1, start2, end2);
          form.setValue(`time_entries.${index}.total_hours`, calculated, { shouldValidate: false });
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, timeFields]);

  const totalHours = form.watch("time_entries")?.reduce((sum, entry) => sum + (entry.total_hours || 0), 0) || 0;

  const handleSubmit = (values: WorkReportFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        
        {/* Bolla di lavoro (operativo) */}
        <div className="space-y-4 rounded-lg border p-6 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bolla di lavoro (operativo)</h3>
            {clientName && <span className="text-sm text-gray-600 dark:text-gray-400">Cliente: {clientName}</span>}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <FormField
              control={form.control}
              name="client_absent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium">Cliente assente (firma non raccolta)</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <Button type="button" variant="outline" className="ml-auto flex items-center gap-2">
              <Printer size={16} />
              Stampa bolla
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="work_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrizione lavori svolti</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrivi l'intervento..." 
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="operative_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note operative (opz.)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Es. misure, pressioni, anomalie..." 
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Ore di lavoro (uomo/ora) */}
        <div className="space-y-4 rounded-lg border p-6 bg-white dark:bg-gray-900">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Ore di lavoro (uomo/ora)</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Aggiungi una riga per tecnico e per giorno. Le ore si calcolano da Inizio/Fine su 1 o 2 fasce (es. pausa pranzo).
            </p>
          </div>

          <div className="space-y-4">
            {timeFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name={`time_entries.${index}.date`}
                    render={({ field: dateField }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-xs">Data</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !dateField.value && "text-muted-foreground"
                                )}
                              >
                                {dateField.value ? (
                                  format(dateField.value, "dd/MM/yyyy")
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
                              selected={dateField.value}
                              onSelect={dateField.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name={`time_entries.${index}.technician`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Tecnico</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome tecnico" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-3 grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name={`time_entries.${index}.time_slot_1_start`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Fascia 1 Inizio</FormLabel>
                        <FormControl>
                          <Input placeholder="--:--" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`time_entries.${index}.time_slot_1_end`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Fascia 1 Fine</FormLabel>
                        <FormControl>
                          <Input placeholder="--:--" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-3 grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name={`time_entries.${index}.time_slot_2_start`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Fascia 2 Inizio (opz.)</FormLabel>
                        <FormControl>
                          <Input placeholder="--:--" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`time_entries.${index}.time_slot_2_end`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Fascia 2 Fine (opz.)</FormLabel>
                        <FormControl>
                          <Input placeholder="--:--" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-1">
                  <FormField
                    control={form.control}
                    name={`time_entries.${index}.total_hours`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Ore</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" disabled {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTime(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => appendTime({ 
              date: new Date(), 
              technician: '', 
              time_slot_1_start: '', 
              time_slot_1_end: '', 
              time_slot_2_start: '', 
              time_slot_2_end: '', 
              total_hours: 0 
            })}
            className="flex items-center gap-2"
          >
            <PlusCircle size={16} />
            + Riga ore
          </Button>

          <div className="flex flex-wrap items-center justify-end gap-6 pt-4 border-t">
            <div className="text-lg font-semibold">
              Totale ore: {totalHours.toFixed(2)}
            </div>
            
            <FormField
              control={form.control}
              name="kilometers"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormLabel className="text-sm">Km (opz.)</FormLabel>
                  <FormControl>
                    <Input type="number" className="w-24" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Ricambi / Materiali utilizzati */}
        <div className="space-y-4 rounded-lg border p-6 bg-white dark:bg-gray-900">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Ricambi / Materiali utilizzati</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Default 6 righe. Puoi aggiungerne altre.
            </p>
          </div>

          <div className="space-y-2">
            {materialFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name={`materials.${index}.unit`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={`text-xs ${index > 0 ? 'sr-only' : ''}`}>U.M.</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="U.M." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PZ">PZ</SelectItem>
                            <SelectItem value="MT">MT</SelectItem>
                            <SelectItem value="KG">KG</SelectItem>
                            <SelectItem value="LT">LT</SelectItem>
                            <SelectItem value="NR">NR</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name={`materials.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={`text-xs ${index > 0 ? 'sr-only' : ''}`}>Quantità</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-7">
                  <FormField
                    control={form.control}
                    name={`materials.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={`text-xs ${index > 0 ? 'sr-only' : ''}`}>Descrizione materiale</FormLabel>
                        <FormControl>
                          <Input placeholder="Descrizione" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMaterial(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => appendMaterial({ unit: 'PZ', quantity: 0, description: '' })}
            className="flex items-center gap-2"
          >
            <PlusCircle size={16} />
            + Riga
          </Button>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Link href="/interventions">
            <Button type="button" variant="outline">Annulla</Button>
          </Link>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Salva Bolla
          </Button>
        </div>
      </form>
    </Form>
  );
};