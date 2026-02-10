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
import { useSuppliers } from '@/context/supplier-context';
import { Edit, Trash2, PlusCircle, Factory, Phone, Mail } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import Link from 'next/link';

export const SupplierTable = () => {
  const { suppliers, deleteSupplier } = useSuppliers();

  const handleDeleteClick = (id: string) => {
    deleteSupplier(id);
  };

  return (
    <div className="ds-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-foreground">Fornitori</h1>
          <p className="text-sm text-muted-foreground">Gestione dei fornitori di servizi e materiali</p>
        </div>

        <Link href="/suppliers/new" passHref>
          <Button variant="default" className="w-full sm:w-auto">
            <PlusCircle className="ds-icon" />
            <span>Aggiungi Fornitore</span>
          </Button>
        </Link>
      </div>

      {suppliers.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-[14px] border border-dashed">
          <Factory className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Nessun fornitore trovato. Inizia aggiungendone uno.</p>
        </div>
      ) : (
        <div className="table-responsive rounded-[14px] border border-border/50">
          <Table className="table-compact">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Ragione Sociale</TableHead>
                <TableHead>Contatti</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                    {supplier.ragione_sociale}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs gap-1">
                      {supplier.telefono && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {supplier.telefono}
                        </div>
                      )}
                      {supplier.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {supplier.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/suppliers/${supplier.id}/edit`} passHref>
                        <Button variant="ghost" size="icon" title="Modifica">
                          <Edit className="ds-icon text-muted-foreground" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(supplier.id)}
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