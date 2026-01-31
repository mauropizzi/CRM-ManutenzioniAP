"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale'; // Importa la locale italiana
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { InterventionRequest } from '@/types/intervention';

export const interventionFormSchema = z.object({
  client_company_name: z.string().min(2, { message: "La ragione sociale deve contenere almeno 2 caratteri." }),
  client_email: z.string().email({ message: "Inserisci un'email valida." }),
  client_phone: z.string().min(10, { message: "Il numero di telefono deve contenere almeno 10 cifre." }),
  client_address: z.string().min(5, { message: "L'indirizzo deve contenere almeno 5 caratteri." }),
  referente: z.string().optional().or(z.literal('')), // Aggiunto il campo referente
  system_type: z.string().min(2, { message: "Il tipo di impianto deve contenere almeno 2 caratteri." }),
  brand: z.string().min(2, { message: "La marca deve contenere almeno 2 caratteri." }),
  model: z.string().min(2, { message: "Il modello deve contenere almeno 2 caratteri." }),
  serial_number: z.string().min(2, { message: "La matricola deve contenere almeno 2 caratteri." }),
  system_location: z.string().min(5, { message: "L'ubicazione dell'impianto deve contenere almeno 5 caratteri." }),
  internal_ref: z.string().optional().or(z.literal('')),
  scheduled_date: z.date().optional(),
  scheduled_time: z.string().optional().or(z.literal('')),
  status: z.enum(['Da fare', 'In corso', 'Completato', 'Annullato']),
  assigned_technicians: z.string().optional().or(z.literal('')),
  office_notes: z.string().optional().or(z.literal('')),
});

export type InterventionFormValues = z.infer<typeof interventionFormSchema>;

interface InterventionFormProps {
  initialData?: InterventionRequest;
  onSubmit: (data: InterventionFormValues) => void;
}

// Funzione per generare le opzioni dell'ora
const generateTimeOptions = () => {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      times.push(`${hour}:${minute}`);
    }
  }
  return times;
};

const timeOptions = generateTimeOptions();

export const InterventionForm = ({ initialData, onSubmit }: InterventionFormProps) => {
  const form = useForm<InterventionFormValues>({
    resolver: zodResolver(interventionFormSchema),
    defaultValues: {
      client_company_name: initialData?.client_company_name ?? '',
      client_email: initialData?.client_email ?? '',
      client_phone: initialData?.client_phone ?? '',
      client_address: initialData?.client_address ?? '',
      referente: initialData?.referente ?? '', // Aggiunto il default value per referente
      system_type: initialData?.system_type ?? '',
      brand: initialData?.brand ?? '',
      model: initialData?.model ?? '',
      serial_number: initialData?.serial_number ?? '',
      system_location: initialData?.system_location ?? '',
      internal_ref: initialData?.internal_ref ?? '',
      scheduled_date: initialData?.scheduled_date,
      scheduled_time: initialData?.scheduled_time ?? '',
      status: initialData?.status ?? 'Da fare',
      assigned_technicians: initialData?.assigned_technicians ?? '',
      office_notes: initialData?.office_notes ?? '',
    },
  });

  const handleSubmit = (values: InterventionFormValues) => {
    console.log('InterventionForm handleSubmit called with:', values);
    onSubmit(values);
  };

  // Debug: log form errors
  React.useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      console.error('Form validation errors:', form.formState.errors);
    }
  }, [form.formState.errors]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 p-4">
        {/* Anagrafica cliente */}
        <div className="grid gap-6 rounded-lg border p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Anagrafica cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="client_company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Ragione sociale / Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ragione sociale o nome" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="client_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Email cliente *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="cliente@email.it" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="client_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Telefono *</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="1234567890" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="client_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Indirizzo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Via Roma 1, Milano" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="referente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Referente (opz.)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome del referente" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Impianto / Modello macchina */}
        <div className="grid gap-6 rounded-lg border p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Impianto / Modello macchina</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="system_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Tipo impianto *</FormLabel>
                  <FormControl>
                    <Input placeholder="Tipo impianto" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Marca *</FormLabel>
                  <FormControl>
                    <Input placeholder="Marca" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Modello *</FormLabel>
                  <FormControl>
                    <Input placeholder="Modello" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="serial_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Matricola *</FormLabel>
                  <FormControl>
                    <Input placeholder="Matricola" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="system_location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Ubicazione impianto *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ubicazione impianto" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="internal_ref"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Rif. interno (opz.)</FormLabel>
                  <FormControl>
                    <Input placeholder="Riferimento interno" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Programmazione / Dati intervento */}
        <div className="grid gap-6 rounded-lg border p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Programmazione / Dati intervento</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
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
                            format(field.value, "dd/MM/yyyy", { locale: it }) // Usa la locale italiana
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
                        locale={it} // Passa la locale italiana al calendario
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
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
              control={form.control}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="assigned_technicians"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Tecnici assegnati (testo)</FormLabel>
                  <FormControl>
                    <Input placeholder="Es. Marco, Luca" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="office_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Note ufficio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Es. urgenza, accesso, contatti..." {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Errori di validazione */}
        {Object.keys(form.formState.errors).length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-semibold">Correggi i seguenti errori:</p>
            <ul className="mt-2 list-disc list-inside text-sm">
              {Object.entries(form.formState.errors).map(([field, error]) => (
                <li key={field}>{error?.message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Link href="/interventions" passHref>
            <Button type="button" variant="outline" className="rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
              Annulla
            </Button>
          </Link>
          <Button 
            type="submit" 
            className="rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Registrazione...' : (initialData ? 'Salva Modifiche' : 'Registra Richiesta')}
          </Button>
        </div>
      </form>
    </Form>
  );
};