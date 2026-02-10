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
import { Edit, Trash2, PlusCircle, Eye, MapPin, Building2, HardDrive, Tag } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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
    <div className="card-base p-6">
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
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Impianto / Marca</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Indirizzo / Città</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Contatti</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Attivo</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 rounded-tr-md">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {customers.map((customer: Customer) => (
                <TableRow key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{customer.ragione_sociale}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{customer.referente || 'Nessun referente'}</div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {customer.system_type ? (
                        <div className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
                          <HardDrive size={14} className="text-blue-500" />
                          {customer.system_type}
                        </div>
                      ) : null}
                      {customer.brand ? (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 italic">
                          <Tag size={14} className="text-orange-500" />
                          {customer.brand}
                        </div>
                      ) : null}
                      {!customer.system_type && !customer.brand && (
                        <span className="text-xs text-gray-400">N/D</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 dark:text-gray-300">{customer.indirizzo}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{customer.citta} ({customer.provincia})</div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 dark:text-gray-300">{customer.telefono}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">{customer.email}</div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    <Badge className={`rounded-full px-2 py-1 text-xs font-semibold ${customer.attivo ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {customer.attivo ? 'Sì' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-1">
                    <Link
                      href={`/customers/${customer.id}/service-points`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "rounded-md text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-gray-700"
                      )}
                      title="Punti Servizio"
                    >
                      <Building2 size={16} className="mr-1" />
                      Punti
                    </Link>
                    <Link
                      href={getGoogleMapsLink(customer)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "rounded-md text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-gray-700 h-8 w-8"
                      )}
                      title="Naviga"
                    >
                      <MapPin size={16} />
                    </Link>
                    <Link href={`/customers/${customer.id}/edit`} passHref>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-md text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700 h-8 w-8"
                        title="Modifica"
                      >
                        <Edit size={16} />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(customer.id)}
                      className="rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700 h-8 w-8"
                      title="Elimina"
                    >
                      <Trash2 size={16} />
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