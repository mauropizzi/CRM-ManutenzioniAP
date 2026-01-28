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
import { DialogFooter } from '@/components/ui/dialog';
import { Customer } from '@/types/customer';

const formSchema = z.object({
  name: z.string().min(2, { message: "Il nome deve contenere almeno 2 caratteri." }),
  email: z.string().email({ message: "Inserisci un'email valida." }),
  phone: z.string().min(10, { message: "Il numero di telefono deve contenere almeno 10 cifre." }),
  address: z.string().min(5, { message: "L'indirizzo deve contenere almeno 5 caratteri." }),
});

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (data: Omit<Customer, 'id'> | Customer) => void;
  onClose: () => void;
}

export const CustomerForm = ({ initialData, onSubmit, onClose }: CustomerFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({ name: '', email: '', phone: '', address: '' });
    }
  }, [initialData, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(initialData ? { ...initialData, ...values } : values);
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome cliente" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
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
              <FormLabel className="text-gray-700 dark:text-gray-300">Telefono</FormLabel>
              <FormControl>
                <Input placeholder="123-456-7890" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Indirizzo</FormLabel>
              <FormControl>
                <Input placeholder="Via Roma 1, Milano" {...field} className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
            Annulla
          </Button>
          <Button type="submit" className="rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2">
            {initialData ? 'Salva Modifiche' : 'Aggiungi Cliente'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};