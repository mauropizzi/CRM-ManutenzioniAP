"use client";

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Customer } from '@/types/customer';
import { useCustomers } from '@/context/customer-context';
import { Edit, Trash2, PlusCircle, Eye, MapPin, Building2 } from 'lucide-react'; // Importa l'icona MapPin
import { Toaster } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Funzione per generare il link di Google Maps
const getGoogleMapsLink = (customer: Customer) => {
  const address = `${customer.indirizzo}, ${customer.citta}, ${customer.cap}, ${customer.provincia}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
};

export const CustomerTable = () => {
  const { customers, deleteCustomer } = useCustomers();

  const handleDeleteClick = (id: string) => {
    deleteCustomer(id);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Anagrafica Clienti</h2>
        <Link href="/customers/new" passHref>
          <Button className="rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 flex items-center gap-2">
            <PlusCircle size={18} /> Aggiungi Cliente
          </Button>
        </Link>
      </div>

      {customers.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nessun cliente trovato. Aggiungi un nuovo cliente per iniziare!</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
          <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 rounded-tl-md">Ragione Sociale</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Indirizzo</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Città</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Telefono</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Referente</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Attivo</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 rounded-tr-md">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {customers.map((customer: Customer) => (
                <TableRow key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{customer.ragione_sociale}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{customer.indirizzo}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{customer.citta}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{customer.telefono}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{customer.referente}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    <Badge className={`rounded-full px-2 py-1 text-xs font-semibold ${customer.attivo ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {customer.attivo ? 'Sì' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                    <Link
                      href={`/customers/${customer.id}/service-points`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "rounded-md text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-gray-700"
                      )}
                      title="Punti Servizio"
                    >
                      <Building2 size={18} className="mr-1" />
                      Punti Servizio
                    </Link>
                    <Link
                      href={getGoogleMapsLink(customer)} // Usa la funzione per generare il link
                      target="_blank" // Apre in una nuova scheda
                      rel="noopener noreferrer" // Buona pratica di sicurezza
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "rounded-md text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-gray-700"
                      )}
                      title="Naviga con Google Maps"
                    >
                      <MapPin size={18} />
                    </Link>
                    <Link
                      href={`/customers/${customer.id}`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "rounded-md text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
                      )}
                      title="Visualizza Cliente"
                    >
                      <Eye size={18} />
                    </Link>
                    <Link href={`/customers/${customer.id}/edit`} passHref>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-md text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700"
                        title="Modifica Cliente"
                      >
                        <Edit size={18} />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(customer.id)}
                      className="rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
                      title="Elimina Cliente"
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