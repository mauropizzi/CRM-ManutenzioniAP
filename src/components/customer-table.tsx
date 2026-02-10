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
import { Button } from '@/components/ui/button';
import { Customer } from '@/types/customer';
import { useCustomers } from '@/context/customer-context';
import { Edit, Trash2, PlusCircle, Building2, HardDrive, Tag, MapPin, Users } from 'lucide-react';
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
    <div className="ds-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-foreground">Clienti</h1>
          <p className="text-sm text-muted-foreground">Gestione anagrafica e punti servizio</p>
        </div>

        <Link href="/customers/new" passHref>
          <Button variant="default" className="w-full sm:w-auto">
            <PlusCircle className="ds-icon" />
            <span>Aggiungi Cliente</span>
          </Button>
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-[14px] border border-dashed">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Nessun cliente trovato. Inizia aggiungendone uno.</p>
        </div>
      ) : (
        <div className="table-responsive rounded-[14px] border border-border/50">
          <Table className="table-compact">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Ragione Sociale</TableHead>
                <TableHead>Impianto / Marca</TableHead>
                <TableHead>Indirizzo</TableHead>
                <TableHead>Contatti</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer: Customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{customer.ragione_sociale}</span>
                      <span className="text-xs text-muted-foreground">{customer.referente || 'Nessun referente'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      {customer.system_type && (
                        <div className="flex items-center gap-1 text-xs">
                          <HardDrive size={12} className="text-primary" />
                          {customer.system_type}
                        </div>
                      )}
                      {customer.brand && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Tag size={10} className="text-accent" />
                          {customer.brand}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span>{customer.indirizzo}</span>
                      <span className="text-muted-foreground">{customer.citta} ({customer.provincia})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span>{customer.telefono}</span>
                      <span className="text-primary truncate max-w-[120px]">{customer.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("rounded-full border-none px-2 py-0.5 text-[10px]", customer.attivo ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200')}>
                      {customer.attivo ? 'Attivo' : 'Inattivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/customers/${customer.id}/service-points`} passHref>
                        <Button variant="ghost" size="icon" title="Punti Servizio">
                          <Building2 className="ds-icon text-primary" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" asChild title="Naviga">
                        <a href={getGoogleMapsLink(customer)} target="_blank" rel="noopener noreferrer">
                          <MapPin className="ds-icon text-green-600" />
                        </a>
                      </Button>
                      <Link href={`/customers/${customer.id}/edit`} passHref>
                        <Button variant="ghost" size="icon" title="Modifica">
                          <Edit className="ds-icon text-muted-foreground" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(customer.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="ds-icon" />
                      </Button>
                    </div>
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