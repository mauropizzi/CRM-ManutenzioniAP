"use client";

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Customer } from '@/types/customer';
import { useCustomers } from '@/context/customer-context';
import { CustomerForm } from './customer-form';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';

export const CustomerTable = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);

  const handleAddClick = () => {
    setEditingCustomer(undefined);
    setIsFormOpen(true);
  };

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    deleteCustomer(id);
  };

  const handleFormSubmit = (data: Omit<Customer, 'id'> | Customer) => {
    if ('id' in data && data.id) {
      updateCustomer(data as Customer);
    } else {
      addCustomer(data as Omit<Customer, 'id'>);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Anagrafica Clienti</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddClick} className="rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 flex items-center gap-2">
              <PlusCircle size={18} /> Aggiungi Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] p-6 bg-white dark:bg-gray-900 rounded-lg shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {editingCustomer ? 'Modifica Cliente' : 'Aggiungi Nuovo Cliente'}
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                {editingCustomer ? 'Apporta modifiche ai dettagli del cliente qui.' : 'Compila i dettagli per aggiungere un nuovo cliente.'}
              </DialogDescription>
            </DialogHeader>
            <CustomerForm
              initialData={editingCustomer}
              onSubmit={handleFormSubmit}
              onClose={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {customers.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nessun cliente trovato. Aggiungi un nuovo cliente per iniziare!</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
          <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 rounded-tl-md">Nome</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Email</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Telefono</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Indirizzo</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 rounded-tr-md">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {customers.map((customer: Customer) => (
                <TableRow key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{customer.name}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{customer.email}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{customer.phone}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{customer.address}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(customer)}
                      className="rounded-md text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700"
                    >
                      <Edit size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(customer.id)}
                      className="rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Toaster />
    </div>
  );
};