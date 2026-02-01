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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Material, Unit, UNITS } from '@/types/material';
import Link from 'next/link';

export const materialFormSchema = z.object({
  unit: z.enum(UNITS, { required_error: "Seleziona un'unità di misura." }),
  // quantity: z.coerce.number().min(0, { message: "La quantità non può essere negativa." }), // Rimosso
  description: z.string().min(2, { message: "La descrizione deve contenere almeno 2 caratteri." }),
});

export type MaterialFormValues = z.infer<typeof materialFormSchema>;

interface MaterialFormProps {
  initialData?: Material;
  onSubmit: (data: MaterialFormValues) => void;
}

export const MaterialForm = ({ initialData, onSubmit }: MaterialFormProps) => {
  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: {
      unit: initialData?.unit ?? 'PZ',
      // quantity: initialData?.quantity ?? 0, // Rimosso
      description: initialData?.description ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      unit: initialData?.unit ?? 'PZ',
      // quantity: initialData?.quantity ?? 0, // Rimosso
      description: initialData?.description ?? '',
    });
  }, [initialData, form]);

  const handleSubmit = (values: MaterialFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-4">
        <div className="grid gap-6 rounded-lg border p-4 bg-white dark:bg-gray-900 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Dettagli Materiale</h3>
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">Unità di Misura *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Seleziona U.M." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-md border-gray-300 bg-white dark:bg-gray-900">
                    {UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Campo Quantità rimosso */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">Descrizione *</FormLabel>
                <FormControl>
                  <Input placeholder="Descrizione del materiale" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Link href="/materials" passHref>
            <Button type="button" variant="outline" className="rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
              Annulla
            </Button>
          </Link>
          <Button type="submit" className="rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2">
            {initialData ? 'Salva Modifiche' : 'Aggiungi Materiale'}
          </Button>
        </div>
      </form>
    </Form>
  );
};