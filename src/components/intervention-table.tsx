"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toaster } from '@/components/ui/sonner';
import { useInterventionRequests } from '@/context/intervention-context';
import { useTechnicians } from '@/context/technician-context';
import type { InterventionRequest as Intervention } from '@/types/intervention';
import {
  PlusCircle,
  Wrench,
  Calendar,
  MapPin,
  User,
  Filter,
  Search,
  Edit,
} from 'lucide-react';

export function InterventionTable() {
  const router = useRouter();
  const { interventionRequests, loading } = useInterventionRequests();
  const { technicians } = useTechnicians();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const filteredInterventions = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return interventionRequests.filter((intervention) => {
      const matchesSearch =
        !q ||
        String(intervention.client_company_name || '').toLowerCase().includes(q) ||
        String(intervention.system_type || '').toLowerCase().includes(q) ||
        String(intervention.brand || '').toLowerCase().includes(q) ||
        String(intervention.model || '').toLowerCase().includes(q) ||
        String(intervention.assigned_technicians || '').toLowerCase().includes(q) ||
        String(intervention.client_address || '').toLowerCase().includes(q) ||
        String(intervention.office_notes || '').toLowerCase().includes(q);
      
      const matchesStatus = statusFilter === 'all' || intervention.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [interventionRequests, searchTerm, statusFilter]);

  const stats = React.useMemo(() => {
    return {
      total: interventionRequests.length,
      pending: interventionRequests.filter(i => i.status === 'Da fare').length,
      inProgress: interventionRequests.filter(i => i.status === 'In corso').length,
      completed: interventionRequests.filter(i => i.status === 'Completato').length,
    };
  }, [interventionRequests]);

  const handleTechnicianClick = (technicianName: string) => {
    const term = technicianName.trim().toLowerCase();
    setSearchTerm(term);
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return '—';
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  };

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case "Completato":
        return "bg-success/10 text-success border-success/20";
      case "In corso":
        return "bg-info/10 text-info border-info/20";
      case "Da fare":
        return "bg-warning/10 text-warning border-warning/20";
      case "Annullato":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Interventi</h2>
          <p className="text-text-secondary text-sm mt-1">
            Gestisci richieste, assegnazioni e bolla di lavoro
          </p>
        </div>
        <Link href="/interventions/new">
          <Button variant="default" className="gap-2">
            <PlusCircle size={18} />
            Nuovo Intervento
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Totale Interventi</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Da Fare</p>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-warning" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">In Corso</p>
              <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-info" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Completati</p>
              <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Edit className="h-5 w-5 text-success" />
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
                placeholder="Cerca intervento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="sm:w-44">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-text-secondary" />
                    <SelectValue placeholder="Stato" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="Da fare">Da fare</SelectItem>
                  <SelectItem value="In corso">In corso</SelectItem>
                  <SelectItem value="Completato">Completato</SelectItem>
                  <SelectItem value="Annullato">Annullato</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card>
        {loading ? (
          <CardContent className="py-12">
            <div className="text-center text-sm text-text-secondary">
              Caricamento interventi...
            </div>
          </CardContent>
        ) : filteredInterventions.length === 0 ? (
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Wrench className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {interventionRequests.length === 0 ? 'Nessun intervento presente' : 'Nessun intervento trovato'}
              </h3>
              <p className="text-text-secondary mb-6">
                {interventionRequests.length === 0
                  ? 'Aggiungi il primo intervento per iniziare'
                  : 'Prova a modificare i filtri di ricerca o aggiungi un nuovo intervento'}
              </p>
              <Button variant="default" onClick={() => router.push('/interventions/new')}>
                {interventionRequests.length === 0 ? 'Primo Intervento' : 'Nuovo Intervento'}
              </Button>
            </div>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[260px]">
                    Intervento
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[240px]">
                    Dettagli
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[220px]">
                    Assegnazione
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[120px]">
                    Stato
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[160px]">
                    Azioni
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {filteredInterventions.map((intervention: Intervention) => (
                  <TableRow key={intervention.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="px-4 sm:px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Wrench className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {intervention.client_company_name}
                          </div>
                          <div className="text-xs text-text-secondary truncate">
                            {intervention.system_type} • {intervention.brand} {intervention.model}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 sm:px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm text-foreground">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="truncate">{intervention.client_address || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{formatDate(intervention.scheduled_date)}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 sm:px-6 py-4">
                      <div className="space-y-1">
                        {intervention.assigned_technicians ? (
                          <div className="flex items-center gap-1.5 text-sm text-foreground">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <button
                              onClick={() => handleTechnicianClick(intervention.assigned_technicians || '')}
                              className="text-left truncate hover:text-primary transition-colors"
                              title={intervention.assigned_technicians}
                            >
                              {intervention.assigned_technicians}
                            </button>
                          </div>
                        ) : (
                          <div className="text-sm text-text-secondary">—</div>
                        )}
                        {intervention.office_notes && (
                          <div className="text-xs text-text-secondary truncate" title={intervention.office_notes}>
                            {intervention.office_notes}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="px-4 sm:px-6 py-4">
                      <Badge
                        className={`rounded-full px-2.5 py-1 text-xs font-medium border ${statusBadgeClass(intervention.status)}`}
                      >
                        {intervention.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-4 sm:px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/interventions/${intervention.id}/conclude`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-info hover:bg-info/10"
                            title="Concludi intervento"
                          >
                            <Wrench size={14} />
                          </Button>
                        </Link>
                        <Link href={`/interventions/${intervention.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:bg-primary/10"
                            title="Modifica intervento"
                          >
                            <Edit size={14} />
                          </Button>
                        </Link>
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
}

export default InterventionTable;