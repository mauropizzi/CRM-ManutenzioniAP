"use client";

import React from 'react';
import Link from 'next/link';
import { useSuppliers } from '@/context/supplier-context';
import type { Supplier } from '@/types/supplier';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Toaster } from '@/components/ui/sonner';
import {
  Building2,
  Edit,
  Filter,
  Mail,
  Phone,
  PlusCircle,
  Search,
  ShieldCheck,
  Trash2,
  Wrench,
} from 'lucide-react';

export const SupplierTable = () => {
  const { suppliers, loading, deleteSupplier } = useSuppliers();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'active' | 'inactive'>('all');

  const filteredSuppliers = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return suppliers.filter((s) => {
      const matchesSearch =
        !q ||
        String(s.ragione_sociale || '').toLowerCase().includes(q) ||
        String(s.partita_iva || '').toLowerCase().includes(q) ||
        String(s.email || '').toLowerCase().includes(q) ||
        String(s.pec || '').toLowerCase().includes(q) ||
        String(s.telefono || '').toLowerCase().includes(q) ||
        String(s.tipo_servizio || '').toLowerCase().includes(q);

      const isActive = s.attivo !== false;
      const matchesActive =
        activeFilter === 'all' || (activeFilter === 'active' ? isActive : !isActive);

      return matchesSearch && matchesActive;
    });
  }, [suppliers, searchTerm, activeFilter]);

  const stats = React.useMemo(() => {
    const total = suppliers.length;
    const active = suppliers.filter((s) => s.attivo !== false).length;
    const inactive = total - active;
    const serviceTypes = new Set(
      suppliers
        .map((s) => String(s.tipo_servizio || '').trim())
        .filter((t) => t.length > 0)
    ).size;

    return { total, active, inactive, serviceTypes };
  }, [suppliers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Fornitori</h2>
          <p className="text-text-secondary text-sm mt-1">
            Gestisci l'anagrafica fornitori e i servizi associati
          </p>
        </div>
        <Link href="/suppliers/new">
          <Button variant="default" className="gap-2">
            <PlusCircle size={18} />
            Nuovo fornitore
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Totale Fornitori</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Attivi</p>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-success" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Non attivi</p>
              <p className="text-2xl font-bold text-foreground">{stats.inactive}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-warning" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Tipi servizio</p>
              <p className="text-2xl font-bold text-foreground">{stats.serviceTypes}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-info" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary h-4 w-4" />
              <Input
                placeholder="Cerca fornitore..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="sm:w-44">
              <Select value={activeFilter} onValueChange={(v) => setActiveFilter(v as any)}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-text-secondary" />
                    <SelectValue placeholder="Stato" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="active">Solo attivi</SelectItem>
                  <SelectItem value="inactive">Solo non attivi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        {loading ? (
          <CardContent className="py-12">
            <div className="text-center text-sm text-text-secondary">Caricamento…</div>
          </CardContent>
        ) : filteredSuppliers.length === 0 ? (
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {suppliers.length === 0 ? 'Nessun fornitore trovato' : 'Nessun risultato'}
              </h3>
              <p className="text-text-secondary mb-6">
                {suppliers.length === 0
                  ? 'Aggiungi il primo fornitore all’anagrafica'
                  : 'Prova a modificare i filtri di ricerca'}
              </p>
              {suppliers.length === 0 && (
                <Link href="/suppliers/new">
                  <Button variant="default">Primo fornitore</Button>
                </Link>
              )}
            </div>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[260px]">
                    Fornitore
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[240px]">
                    Contatti
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[220px]">
                    Servizio
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[120px]">
                    Attivo
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[160px]">
                    Azioni
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {filteredSuppliers.map((s: Supplier) => (
                  <TableRow key={s.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {s.ragione_sociale}
                          </div>
                          <div className="text-xs text-text-secondary truncate">
                            P.IVA: {s.partita_iva || '—'}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 sm:px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{s.email || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{s.telefono || '—'}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 sm:px-6 py-4">
                      <div className="text-sm text-foreground">{s.tipo_servizio || '—'}</div>
                      <div className="text-xs text-text-secondary">PEC: {s.pec || '—'}</div>
                    </TableCell>

                    <TableCell className="px-4 sm:px-6 py-4">
                      <Badge
                        className={`rounded-full px-2.5 py-1 text-xs font-medium border ${
                          s.attivo !== false
                            ? 'bg-success/10 text-success border-success/20'
                            : 'bg-warning/10 text-warning border-warning/20'
                        }`}
                      >
                        {s.attivo !== false ? 'Sì' : 'No'}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-4 sm:px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/suppliers/${s.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:bg-primary/10"
                            title="Modifica Fornitore"
                          >
                            <Edit size={14} />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSupplier(s.id)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          title="Elimina Fornitore"
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
      </Card>

      <Toaster />
    </div>
  );
};

export default SupplierTable;