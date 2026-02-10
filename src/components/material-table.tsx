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
import { useMaterials } from '@/context/material-context';
import { Edit, Trash2, PlusCircle, Package, Layers } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const MaterialTable = () => {
  const { materials, deleteMaterial } = useMaterials();

  const handleDeleteClick = (id: string) => {
    deleteMaterial(id);
  };

  return (
    <div className="ds-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-foreground">Materiali</h1>
          <p className="text-sm text-muted-foreground">Catalogo ricambi e materiali di consumo</p>
        </div>

        <Link href="/materials/new" passHref>
          <Button variant="default" className="w-full sm:w-auto">
            <PlusCircle className="ds-icon" />
            <span>Aggiungi Materiale</span>
          </Button>
        </Link>
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-[14px] border border-dashed">
          <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Catalogo vuoto. Inizia aggiungendo un materiale.</p>
        </div>
      ) : (
        <div className="table-responsive rounded-[14px] border border-border/50">
          <Table className="table-compact">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[80px]">Icona</TableHead>
                <TableHead>Descrizione</TableHead>
                <TableHead>Unità</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell>
                    <div className="h-10 w-10 rounded-[10px] bg-primary/10 flex items-center justify-center text-primary">
                      <Layers size={18} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{material.description}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-full border-none px-3 bg-muted/50 text-muted-foreground font-semibold text-[10px] uppercase tracking-wider">
                      {material.unit}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/materials/${material.id}/edit`} passHref>
                        <Button variant="ghost" size="icon" title="Modifica">
                          <Edit className="ds-icon text-muted-foreground" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(material.id)}
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