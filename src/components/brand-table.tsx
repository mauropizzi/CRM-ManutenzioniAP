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
import { Brand } from '@/types/brand';
import { useBrands } from '@/context/brand-context';
import { Edit, Trash2, PlusCircle, Search, Filter, Package } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UpsertBrandDialog from './upsert-brand-dialog';

export const BrandTable = () => {
  const { brands, deleteBrand, createBrand } = useBrands();
  const [searchTerm, setSearchTerm] = React.useState('');

  // Ottieni a lista filtrata
  const filtered = brands.filter((b) => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Marche</h2>
          <p className="text-text-secondary text-sm mt-1">Gestisci le marche</p>
        </div>
        <Link href="/brands/new">
          <Button variant="default" className="gap-2">
            <PlusCircle size={18} />
            Nuova Marca
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary h-4 w-4" />
            <Input placeholder="Cerca marca..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Nessuna marca trovata</h3>
              <p className="text-text-secondary mb-6">Aggiungi una nuova marca per iniziare.</p>
              <UpsertBrandDialog mode="create" onSave={async (name) => createBrand({ name } as any)} />
            </div>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Nome</TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {filtered.map((brand: Brand) => (
                  <TableRow key={brand.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="px-4 sm:px-6 py-4 text-sm font-medium text-foreground">{brand.name}</TableCell>
                    <TableCell className="px-4 sm:px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <UpsertBrandDialog mode="edit" brand={brand} onSave={async (name) => createBrand({ name } as any)} />
                        <Button variant="ghost" size="icon" onClick={() => deleteBrand(brand.id)}>
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Toaster />
    </div>
  );
};

export default BrandTable;