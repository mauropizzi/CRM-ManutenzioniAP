"use client";

import React from 'react';
import Link from 'next/link';
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
import { useTechnicians } from '@/context/technician-context';
import type { Technician } from '@/types/technician';
import {
  Edit,
  Filter,
  PlusCircle,
  Search,
  Trash2,
  User,
  UserCheck,
  UserX,
  Wrench,
} from 'lucide-react';

export const TechnicianTable = () => {
  const { technicians, deleteTechnician } = useTechnicians();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'active' | 'inactive'>('all');

  const filteredTechnicians = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return technicians.filter((t) => {
      const matchesSearch =
        !q ||
        `${t.first_name} ${t.last_name}`.toLowerCase().includes(q) ||
        String(t.email || '').toLowerCase().includes(q) ||
        String(t.phone || '').toLowerCase().includes(q) ||
        String(t.specialization || '').toLowerCase().includes(q);

      const isActive = !!t.is_active;
      const matchesActive =
        activeFilter === 'all' || (activeFilter === 'active' ? isActive : !isActive);

      return matchesSearch && matchesActive;
    });
  }, [technicians, searchTerm, activeFilter]);

  const stats = React.useMemo(() => {
    const total = technicians.length;
    const active = technicians.filter((t) => t.is_active).length;
    const inactive = total - active;
    const specializations = new Set(
      technicians
        .map((t) => String(t.specialization || '').trim())
        .filter((s) => s.length > 0)
    ).size;

    return { total, active, inactive, specializations };
  }, [technicians]);

  const handleDeleteClick = (id: string) => {
    deleteTechnician(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tecnici</h2>
          <p className="text-text-secondary text-sm mt-1">
            Gestisci l'anagrafica dei tecnici e le loro disponibilità
          </p>
        </div>
        <Link href="/technicians/new">
          <Button variant="default" className="gap-2">
            <PlusCircle size={18} />
            Aggiungi Tecnico
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Totale Tecnici</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
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
              <UserCheck className="h-5 w-5 text-success" />
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
              <UserX className="h-5 w-5 text-warning" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Specializzazioni</p>
              <p className="text-2xl font-bold text-foreground">{stats.specializations}</p>
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
                placeholder="Cerca tecnico..."
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
        {filteredTechnicians.length === 0 ? (
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {technicians.length === 0 ? 'Nessun tecnico trovato' : 'Nessun risultato'}
              </h3>
              <p className="text-text-secondary mb-6">
                {technicians.length === 0
                  ? 'Aggiungi il primo tecnico all\'anagrafica'
                  : 'Prova a modificare i filtri di ricerca'}
              </p>
              {technicians.length === 0 && (
                <Link href="/technicians/new">
                  <Button variant="default">Primo Tecnico</Button>
                </Link>
              )}
            </div>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[220px]">
                    Tecnico
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[220px]">
                    Contatti
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[180px]">
                    Specializzazione
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
                {filteredTechnicians.map((t: Technician) => (
                  <TableRow key={t.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {t.first_name} {t.last_name}
                          </div>
                          {t.notes ? (
                            <div className="text-xs text-text-secondary truncate max-w-[360px]">
                              {t.notes}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 sm:px-6 py-4">
                      <div className="text-sm text-foreground">{t.email || '—'}</div>
                      <div className="text-xs text-text-secondary">{t.phone || '—'}</div>
                    </TableCell>

                    <TableCell className="px-4 sm:px-6 py-4">
                      <div className="text-sm text-foreground">{t.specialization || '—'}</div>
                    </TableCell>

                    <TableCell className="px-4 sm:px-6 py-4">
                      <Badge
                        className={`rounded-full px-2.5 py-1 text-xs font-medium border ${
                          t.is_active
                            ? 'bg-success/10 text-success border-success/20'
                            : 'bg-warning/10 text-warning border-warning/20'
                        }`}
                      >
                        {t.is_active ? 'Sì' : 'No'}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-4 sm:px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/technicians/${t.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:bg-primary/10"
                            title="Modifica Tecnico"
                          >
                            <Edit size={14} />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(t.id)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          title="Elimina Tecnico"
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