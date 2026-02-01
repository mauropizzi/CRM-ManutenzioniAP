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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusCircle, Trash2, Printer, ChevronUp, ChevronDown } from 'lucide-react';
import { format, parse, differenceInMinutes } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { InterventionRequest } from '@/types/intervention';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Helper function to calculate hours from time slots
const calculateHours = (start1: string, end1: string, start2?: string, end2?: string): number => {
  let totalMinutes = 0;

  const parseTime = (time: string) => {
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
  technician: z.string().min(2, { message: "Inserisci il nome del tecnico." }),
  time_slot_1_start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato ora non valido (HH:MM)." }),
  time_slot_1_end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato ora non valido (HH:MM)." }),
  time_slot_2_start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato ora non valido (HH:MM)." }).optional().or(z.literal('')),
  time_slot_2_end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Formato ora non valido (HH:MM)." }).optional().or(z.literal('')),
  total_hours: z.number().min(0),
}).refine(data => {
  const hours = calculateHours(data.time_slot_1_start, data.time_slot_1_end, data.time_slot_2_start, data.time_slot_2_end);
  return hours > 0 || (data.time_slot_1_start === '' && data.time_slot_1_end === '' && data.time_slot_2_start === '' && data.time_slot_2_end === '');
}, {
  message: "Le ore di lavoro devono essere maggiori di zero se inserite.",
  path: ["total_hours"],
});

const materialUsedSchema = z.object({
  unit: z.string().min(1, { message: "Seleziona un'unità." }),
  quantity: z.coerce.number().min(0, { message: "La quantità non può essere negativa." }),
  description: z.string().min(2, { message: "Inserisci una descrizione del materiale." }),
});

export const interventionConclusionFormSchema = z.object({
  // These fields are optional in InterventionRequest, so make them optional in Zod schema
  intervention_concluded: z.boolean().optional(),
  request_quote: z.boolean().optional(),
  client_absent: z.boolean().optional(),
  work_description: z.string().min(10, { message: "Descrivi i lavori svolti (almeno 10 caratteri)." }).optional(),
  operative_notes_conclusion: z.string().optional(),
  time_entries: z.array(timeEntrySchema).optional(),
  kilometers: z.coerce.number().min(0, { message: "I Km non possono essere negativi." }).optional(),
  materials_used: z.array(materialUsedSchema).optional(),
});

export type InterventionConclusionFormValues = z.infer<typeof interventionConclusionFormSchema>;

interface InterventionConclusionFormProps {
  initialData?: InterventionRequest;
  onSubmit: (data: InterventionConclusionFormValues) => void;
}

export const InterventionConclusionForm = ({ initialData, onSubmit }: InterventionConclusionFormProps) => {
  const form = useForm<InterventionConclusionFormValues>({
    resolver: zodResolver(interventionConclusionFormSchema),
    defaultValues: {
      // Provide explicit fallbacks for optional fields that are expected by the form
      intervention_concluded: initialData?.intervention_concluded ?? false,
      request_quote: initialData?.request_quote ?? false,
      client_absent: initialData?.client_absent ?? false,
      work_description: initialData?.work_description ?? '',
      operative_notes_conclusion: initialData?.operative_notes_conclusion ?? '',
      time_entries: initialData?.time_entries?.map(entry => ({
        ...entry,
        date: new Date(entry.date),
      })) ?? [],
      kilometers: initialData?.kilometers ?? 0,
      materials_used: initialData?.materials_used ?? [],
    },
  });

  const { fields: timeFields, append: appendTime, remove: removeTime } = useFieldArray({
    control: form.control,
    name: "time_entries",
  });

  const { fields: materialFields, append: appendMaterial, remove: removeMaterial } = useFieldArray({
    control: form.control,
    name: "materials_used",
  });

  // Calculate total hours dynamically
  const totalHours = form.watch("time_entries")?.reduce((sum, entry) => sum + (entry.total_hours || 0), 0) || 0;

  useEffect(() => {
    // Update total_hours for each time entry when time slots change
    timeFields.forEach((field, index) => {
      const start1 = form.getValues(`time_entries.${index}.time_slot_1_start`);
      const end1 = form.getValues(`time_entries.${index}.time_slot_1_end`);
      const start2 = form.getValues(`time_entries.${index}.time_slot_2_start`);
      const end2 = form.getValues(`time_entries.${index}.time_slot_2_end`);
      const calculated = calculateHours(start1, end1, start2, end2);
      if (calculated !== field.total_hours) {
        form.setValue(`time_entries.${index}.total_hours`, calculated, { shouldValidate: true });
      }
    });
  }, [form.watch("time_entries"), timeFields, form]);


  const handleSubmit = (values: InterventionConclusionFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 p-4">
        {/* Esito tecnico (non in bolla) */}
        <div className="grid gap-6 rounded-lg border p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Esito tecnico (non in bolla)</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Queste informazioni restano interne e non vengono stampate nella bolla.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="intervention_concluded"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="rounded-sm data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=checked]:bg-blue-500 dark:data-[state=unchecked]:bg-gray-700"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-gray-700 dark:text-gray-300">Intervento concluso</FormLabel>
                    <FormDescription className="text-gray-600 dark:text-gray-400">
                      Spunta quando l'intervento è terminato.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="request_quote"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="rounded-sm data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=checked]:bg-blue-500 dark:data-[state=unchecked]:bg-gray-700"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-gray-700 dark:text-gray-300">Richiede preventivo</FormLabel>
                    <FormDescription className="text-gray-600 dark:text-gray-400">
                      Spunta se è necessario un preventivo.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Bolla di lavoro (operativo) */}
        <div className="grid gap-6 rounded-lg border p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Bolla di lavoro (operativo)</h3>
          <div className="flex justify-between items-center">
            <FormField
              control={form.control}
              name="client_absent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="rounded-sm data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=checked]:bg-blue-500 dark:data-[state=unchecked]:bg-gray-700"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-gray-700 dark:text-gray-300">Cliente assente (firma non raccolta)</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <Button variant="outline" className="rounded-md px-4 py-2 flex items-center gap-2">
              <Printer size={18} /> Stampa bolla
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="work_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Descrizione lavori svolti</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrivi l'intervento..." {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[120px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="operative_notes_conclusion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Note operative (opz.)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Es. misure, pressioni, anomalie..." {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[120px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Ore di lavoro (uomo/ora) */}
        <div className="grid gap-6 rounded-lg border p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Ore di lavoro (uomo/ora)</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Aggiungi una riga per tecnico e per giorno. Le ore si calcolano da Inizio/Fine su 1 o 2 fasce (es. pausa pranzo).</p>

          {timeFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-end border-t border-gray-200 dark:border-gray-700 pt-4">
              <FormField
                control={form.control}
                name={`time_entries.${index}.date`}
                render={({ field: dateField }) => (
                  <FormItem className="flex flex-col col-span-full sm:col-span-1">
                    <FormLabel className="text-gray-700 dark:text-gray-300">Data</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                              !dateField.value && "text-muted-foreground"
                            )}
                          >
                            {dateField.value ? (
                              format(dateField.value, "dd/MM/yyyy")
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
              <FormField
                control={form.control}
                name={`time_entries.${index}.technician`}
                render={({ field }) => (
                  <FormItem className="col-span-full sm:col-span-1">
                    <FormLabel className="text-gray-700 dark:text-gray-300">Tecnico</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome tecnico" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="col-span-full sm:col-span-2 grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name={`time_entries.${index}.time_slot_1_start`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Fascia 1 Inizio</FormLabel>
                      <FormControl>
                        <Input placeholder="-- : --" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
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
                      <FormLabel className="text-gray-700 dark:text-gray-300">Fascia 1 Fine</FormLabel>
                      <FormControl>
                        <Input placeholder="-- : --" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`time_entries.${index}.time_slot_2_start`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Fascia 2 Inizio (opz.)</FormLabel>
                      <FormControl>
                        <Input placeholder="-- : --" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
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
                      <FormLabel className="text-gray-700 dark:text-gray-300">Fascia 2 Fine (opz.)</FormLabel>
                      <FormControl>
                        <Input placeholder="-- : --" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name={`time_entries.${index}.total_hours`}
                render={({ field }) => (
                  <FormItem className="col-span-full sm:col-span-1">
                    <FormLabel className="text-gray-700 dark:text-gray-300">Ore</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} disabled className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeTime(index)}
                className="rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700 col-span-full sm:col-span-auto"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => appendTime({ date: new Date(), technician: '', time_slot_1_start: '', time_slot_1_end: '', time_slot_2_start: '', time_slot_2_end: '', total_hours: 0 })}
            className="rounded-md bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center gap-2 self-start"
          >
            <PlusCircle size={18} /> Aggiungi riga ore
          </Button>

          <div className="flex justify-end items-center gap-4 mt-4">
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Totale ore: {totalHours.toFixed(2)}</span>
            <FormField
              control={form.control}
              name="kilometers"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormLabel className="text-gray-700 dark:text-gray-300">Km (opz.)</FormLabel>
                  <FormControl>
                    <Input type="number" step="1" placeholder="0" {...field} className="w-24 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Ricambi / Materiali utilizzati */}
        <div className="grid gap-6 rounded-lg border p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Ricambi / Materiali utilizzati</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Default 6 righe. Puoi aggiungerne altre.</p>

          {materialFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end border-t border-gray-200 dark:border-gray-700 pt-4">
              <FormField
                control={form.control}
                name={`materials_used.${index}.unit`}
                render={({ field }) => (
                  <FormItem className="col-span-full sm:col-span-1">
                    <FormLabel className="text-gray-700 dark:text-gray-300">U.M.</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Seleziona U.M." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-md border-gray-300 bg-white dark:bg-gray-900">
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
              <FormField
                control={form.control}
                name={`materials_used.${index}.quantity`}
                render={({ field }) => (
                  <FormItem className="col-span-full sm:col-span-1">
                    <FormLabel className="text-gray-700 dark:text-gray-300">Quantità</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="0" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`materials_used.${index}.description`}
                render={({ field }) => (
                  <FormItem className="col-span-full sm:col-span-1">
                    <FormLabel className="text-gray-700 dark:text-gray-300">Descrizione materiale</FormLabel>
                    <FormControl>
                      <Input placeholder="Descrizione" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeMaterial(index)}
                className="rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700 col-span-full sm:col-span-auto"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => appendMaterial({ unit: 'PZ', quantity: 0, description: '' })}
            className="rounded-md bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center gap-2 self-start"
          >
            <PlusCircle size={18} /> Aggiungi riga materiale
          </Button>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Link href="/interventions" passHref>
            <Button type="button" variant="outline" className="rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
              Annulla
            </Button>
          </Link>
          <Button type="submit" className="rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2">
            Salva Conclusione
          </Button>
        </div>
      </form>
    </Form>
  );
};