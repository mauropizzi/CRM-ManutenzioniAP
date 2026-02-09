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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Material } from '@/types/material';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const commonUnits = [
  { value: 'PZ', label: 'Pezzi', icon: '📦' },
  { value: 'MT', label: 'Metri', icon: '📏' },
  { value: 'KG', label: 'Kilogrammi', icon: '⚖️' },
  { value: 'LT', label: 'Litri', icon: '🥤' },
  { value: 'KG', label: 'Chilogrammi', icon: '⚖️' },
  { value: 'M2', label: 'Metri Quadri', icon: '📐' },
  { value: 'M3', label: 'Metri Cubi', icon: '📦' },
  { value: 'HZ', label: 'Hertz', icon: '📊' },
  { value: 'BTU', label: 'BTU', icon: '🌡️' },
  { value: 'BAR', label: 'Bar', icon: '🔧' },
];

export const formSchema = z.object({
  unit: z.string().min(1, { message: "Seleziona un'unità di misura." }),
  description: z.string().min(2, { message: "La descrizione deve contenere almeno 2 caratteri." }),
});

export type MaterialFormValues = z.infer<typeof formSchema>;

interface MaterialFormProps {
  initialData?: Material;
  onSubmit: (data: MaterialFormValues) => void;
}

export const MaterialForm = ({ initialData, onSubmit }: MaterialFormProps) => {
  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: initialData?.unit ?? '',
      description: initialData?.description ?? '',
    },
  });

  const getUnitIcon = (unit: string) => {
    const unitData = commonUnits.find(u => u.value === unit);
    return unitData?.icon || '📋';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {initialData ? 'Modifica Materiale' : 'Nuovo Materiale'}
            {form.watch('unit') && (
              <span className="text-lg">{getUnitIcon(form.watch('unit'))}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unità di Misura *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona unità di misura" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {commonUnits.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{unit.icon}</span>
                                <span>{unit.label}</span>
                                <span className="text-xs text-text-secondary ml-auto">({unit.value})</span>
                              </div>
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrizione *</FormLabel>
                      <FormControl>
                        <Input placeholder="Es: Filadro HEPA 395x280mm" {...field} />
                      </FormControl>
                      <FormDescription>
                        Inserisci una descrizione chiara e precisa del materiale
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Anteprima */}
              {form.watch('unit') && form.watch('description') && (
                <Card className="border-dashed border-primary/30 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                          {getUnitIcon(form.watch('unit'))}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{form.watch('description')}</div>
                          <div className="text-sm text-text-secondary">Unità: {form.watch('unit')}</div>
                        </div>
                      </div>
                      <Badge className="rounded-full px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary border-primary/20">
                        Anteprima
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Link href="/materials">
                  <Button type="button" variant="outline">
                    Annulla
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? 'Salvataggio...' : initialData ? 'Salva Modifiche' : 'Aggiungi Materiale'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};