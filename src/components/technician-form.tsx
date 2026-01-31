"use client";

import React, { useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { Technician } from '@/types/technician';

export const technicianFormSchema = z.object({
  first_name: z.string().min(2, { message: "Il nome deve contenere almeno 2 caratteri." }),
  last_name: z.string().min(2, { message: "Il cognome deve contenere almeno 2 caratteri." }),
  email: z.string().email({ message: "Inserisci un'email valida." }).optional().or(z.literal('')),
  phone: z.string().min(10, { message: "Il numero di telefono deve contenere almeno 10 cifre." }).optional().or(z.literal('')),
  specialization: z.string().optional().or(z.literal('')),
  is_active: z.boolean(),
  notes: z.string().optional().or(z.literal('')),
});

export type TechnicianFormValues = z.infer<typeof technicianFormSchema>;

interface TechnicianFormProps {
  initialData?: Technician;
  onSubmit: (data: TechnicianFormValues) => void;
}

export const TechnicianForm = ({ initialData, onSubmit }: TechnicianFormProps) => {
  const form = useForm<TechnicianFormValues>({
    resolver: zodResolver(technicianFormSchema),
    defaultValues: {
      first_name: initialData?.first_name ?? '',
      last_name: initialData?.last_name ?? '',
      email: initialData?.email ?? '',
      phone: initialData?.phone ?? '',
      specialization: initialData?.specialization ?? '',
      is_active: initialData?.is_active ?? true,
      notes: initialData?.notes ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      first_name: initialData?.first_name ?? '',
      last_name: initialData?.last_name ?? '',
      email: initialData?.email ?? '',
      phone: initialData?.phone ?? '',
      specialization: initialData?.specialization ?? '',
      is_active: initialData?.is_active ?? true,
      notes: initialData?.notes ?? '',
    });
  }, [initialData, form]);

  const handleSubmit = (values: TechnicianFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-4">
        {/* Dati Anagrafici */}
        <div className="grid gap-6 rounded-lg border p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Dati Anagrafici</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Cognome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Cognome" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Email (opz.)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="tecnico@email.com" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Telefono (opz.)</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="123-456-7890" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Dettagli Professionali */}
        <div className="grid gap-6 rounded-lg border p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Dettagli Professionali</h3>
          <FormField
            control={form.control}
            name="specialization"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">Specializzazione (opz.)</FormLabel>
                <FormControl>
                  <Input placeholder="Es. Elettricista, Idraulico" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base text-gray-700 dark:text-gray-300">Attivo</FormLabel>
                  <FormDescription className="text-gray-600 dark:text-gray-400">
                    Indica se il tecnico è attualmente attivo.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=checked]:bg-blue-500 dark:data-[state=unchecked]:bg-gray-700"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">Note (opz.)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Aggiungi note sul tecnico..." {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Link href="/technicians" passHref>
            <Button type="button" variant="outline" className="rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
              Annulla
            </Button>
          </Link>
          <Button type="submit" className="rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2">
            {initialData ? 'Salva Modifiche' : 'Aggiungi Tecnico'}
          </Button>
        </div>
      </form>
    </Form>
  );
};