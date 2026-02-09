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
    <div className="container-base py-6">
      <div className="card-base p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Anagrafica Clienti</h2>
            <p className="text-text-secondary text-sm mt-1">Gestisci i clienti e i loro punti servizio</p>
          </div>
          <Link href="/customers/new">
            <Button variant="primary" className="gap-2">
              <PlusCircle size={18} />
              Aggiungi Cliente
            </Button>
          </Link>
        </div>

        {customers.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Nessun cliente trovato</h3>
            <p className="text-text-secondary mb-6">Aggiungi un nuovo cliente per iniziare!</p>
            <Link href="/customers/new">
              <Button variant="primary">Primo Cliente</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Ragione Sociale</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Impianto / Marca</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Indirizzo / Città</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Contatti</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Attivo</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {customers.map((customer: Customer) => (
                  <TableRow key={customer.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-foreground">{customer.ragione_sociale}</div>
                        <div className="text-xs text-text-secondary">{customer.referente || 'Nessun referente'}</div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {customer.system_type ? (
                          <div className="flex items-center gap-2 text-xs text-foreground">
                            <HardDrive size={14} className="text-primary" />
                            <span>{customer.system_type}</span>
                          </div>
                        ) : null}
                        {customer.brand ? (
                          <div className="flex items-center gap-2 text-xs text-text-secondary">
                            <Tag size={14} className="text-warning" />
                            <span>{customer.brand}</span>
                          </div>
                        ) : null}
                        {!customer.system_type && !customer.brand && (
                          <span className="text-xs text-muted-foreground">N/D</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div>
                        <div className="text-sm text-foreground">{customer.indirizzo}</div>
                        <div className="text-xs text-text-secondary">{customer.citta} ({customer.provincia})</div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div>
                        <div className="text-sm text-foreground">{customer.telefono}</div>
                        <div className="text-xs text-primary">{customer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        customer.attivo 
                          ? 'bg-success/10 text-success border-success/20' 
                          : 'bg-danger/10 text-danger border-danger/20'
                      }`}>
                        {customer.attivo ? 'Sì' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/customers/${customer.id}/service-points`}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-primary hover:bg-primary/10"
                            title="Punti Servizio"
                          >
                            <Building2 size={14} className="mr-1" />
                            Punti
                          </Button>
                        </Link>
                        <Link
                          href={getGoogleMapsLink(customer)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-success hover:bg-success/10"
                            title="Naviga"
                          >
                            <MapPin size={14} />
                          </Button>
                        </Link>
                        <Link href={`/customers/${customer.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:bg-primary/10"
                            title="Modifica"
                          >
                            <Edit size={14} />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(customer.id)}
                          className="h-8 w-8 text-danger hover:bg-danger/10"
                          title="Elimina"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
};