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
import { InterventionRequest } from '@/types/intervention';
import { useInterventionRequests } from '@/context/intervention-context';
import { Edit, Trash2, PlusCircle, FileText, MessageCircle } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useTechnicians } from '@/context/technician-context';
import { useSuppliers } from '@/context/supplier-context';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export const InterventionTable = () => {
  const { interventionRequests, deleteInterventionRequest } = useInterventionRequests();
  const { technicians } = useTechnicians();
  const { suppliers } = useSuppliers();

  const handleDeleteClick = (id: string) => {
    deleteInterventionRequest(id);
  };

  const normalize = (s?: string) => (s || '').trim().toLowerCase();

  const getAssignedInfo = (request: InterventionRequest) => {
    const techName = (request.assigned_technicians || '').trim();
    const supplierName = (request.assigned_supplier || '').trim();

    if (techName) {
      const match = technicians.find(
        (t) => normalize(`${t.first_name} ${t.last_name}`) === normalize(techName)
      );
      return {
        type: 'technician' as const,
        name: techName,
        phone: match?.phone || '',
      };
    }

    if (supplierName) {
      const match = suppliers.find(
        (s) => normalize(s.ragione_sociale) === normalize(supplierName)
      );
      return {
        type: 'supplier' as const,
        name: supplierName,
        phone: match?.telefono || '',
      };
    }

    return { type: 'none' as const, name: '', phone: '' };
  };

  const toIntlWhatsAppNumber = (raw?: string) => {
    const digits = String(raw || '').replace(/\D/g, '');
    if (!digits) return '';
    // If number already starts with 39 (Italy), keep it. Otherwise, prefix 39.
    if (digits.startsWith('39')) return digits;
    return `39${digits}`;
  };

  const createPublicLink = async (interventionId: string) => {
    const {
      data: { session },
      error: sessionErr,
    } = await supabase.auth.getSession();

    if (sessionErr) throw sessionErr;
    if (!session?.access_token) throw new Error('Sessione non valida. Effettua di nuovo il login.');

    const res = await fetch(
      'https://nrdsgtuzpnamcovuzghb.supabase.co/functions/v1/create-intervention-public-link',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ interventionId }),
      }
    );

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error || 'Impossibile generare il link pubblico');
    }

    const json = await res.json();
    const token = String(json?.token || '').trim();
    if (!token) throw new Error('Token non valido');
    return token;
  };

  const buildWhatsAppUrl = (request: InterventionRequest, publicToken: string) => {
    const assigned = getAssignedInfo(request);
    if (assigned.type === 'none') return null;

    const intl = toIntlWhatsAppNumber(assigned.phone);
    if (!intl) return null;

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://example.com';
    const link = `${origin}/public/interventions/${publicToken}`;

    const dateStr = request.scheduled_date
      ? format(new Date(request.scheduled_date), 'dd/MM/yyyy', { locale: it })
      : 'N/D';
    const timeStr = request.scheduled_time ? ` ${request.scheduled_time}` : '';

    const intro =
      assigned.type === 'technician'
        ? `Ciao ${assigned.name}, ti è stata assegnata una richiesta di intervento.`
        : `Buongiorno ${assigned.name}, è stata assegnata una richiesta di intervento.`;

    const text = [
      intro,
      `Cliente: ${request.client_company_name}`,
      `Impianto: ${request.system_type} ${request.brand}`,
      `Data/Ora: ${dateStr}${timeStr}`,
      `Apri la richiesta: ${link}`,
    ].join('\n');

    return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
  };

  const handleWhatsAppClick = async (request: InterventionRequest) => {
    const assigned = getAssignedInfo(request);

    if (assigned.type === 'none') {
      toast.error('Nessun tecnico o fornitore assegnato.');
      return;
    }

    if (!assigned.phone || !toIntlWhatsAppNumber(assigned.phone)) {
      toast.error(
        `Numero di telefono non disponibile per ${assigned.name}. Aggiorna l'anagrafica per inviare WhatsApp.`
      );
      return;
    }

    try {
      toast.loading('Sto preparando il messaggio WhatsApp…', { id: `wa-${request.id}` });

      const token = await createPublicLink(request.id);
      const url = buildWhatsAppUrl(request, token);

      if (!url) {
        throw new Error('Impossibile generare il link WhatsApp.');
      }

      toast.success('Messaggio pronto', { id: `wa-${request.id}` });
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e: any) {
      toast.error(e?.message || 'Errore durante la preparazione del messaggio', { id: `wa-${request.id}` });
    }
  };

  const getStatusBadgeClass = (status: InterventionRequest['status']) => {
    switch (status) {
      case 'Da fare':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'In corso':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'Completato':
        return 'bg-success/10 text-success border-success/20';
      case 'Annullato':
        return 'bg-danger/10 text-danger border-danger/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="card-base p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Richieste di Intervento</h2>
          <p className="text-text-secondary text-sm mt-1">Gestisci le richieste di intervento e assegnazioni</p>
        </div>
        <Link href="/interventions/new">
          <Button variant="primary" className="gap-2">
            <PlusCircle size={18} />
            Nuova Richiesta
          </Button>
        </Link>
      </div>

      {interventionRequests.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Nessuna richiesta trovata</h3>
          <p className="text-text-secondary mb-6">Aggiungi una nuova richiesta di intervento per iniziare!</p>
          <Link href="/interventions/new">
            <Button variant="primary">Prima Richiesta</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Cliente</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Tipo Impianto</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Marca</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Data Prevista</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Stato</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Assegnato</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {interventionRequests.map((request: InterventionRequest) => {
                const assigned = getAssignedInfo(request);
                return (
                  <TableRow key={request.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="font-medium text-foreground">{request.client_company_name}</div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-text-secondary">{request.system_type}</TableCell>
                    <TableCell className="px-6 py-4 text-text-secondary">{request.brand}</TableCell>
                    <TableCell className="px-6 py-4 text-text-secondary">
                      {request.scheduled_date ? format(new Date(request.scheduled_date), 'dd/MM/yyyy', { locale: it }) : 'N/D'}
                      {request.scheduled_time && ` ${request.scheduled_time}`}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge className={`rounded-full px-2.5 py-1 text-xs font-medium border ${getStatusBadgeClass(request.status)}`}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {assigned.type === 'none' ? (
                        <span className="text-muted-foreground">Nessuno</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{assigned.name}</span>
                          <Badge
                            className={`rounded-full px-2.5 py-1 text-xs font-medium border ${
                              assigned.type === 'technician'
                                ? 'bg-primary/10 text-primary border-primary/20'
                                : 'bg-success/10 text-success border-success/20'
                            }`}
                          >
                            {assigned.type === 'technician' ? 'Tecnico' : 'Fornitore'}
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/interventions/${request.id}/work-report`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-success hover:bg-success/10"
                            title="Bolla di Consegna"
                          >
                            <FileText size={14} className="mr-1" />
                            Bolla
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleWhatsAppClick(request)}
                          className="h-8 px-2 text-success hover:bg-success/10"
                          title="Invia WhatsApp"
                        >
                          <MessageCircle size={14} className="mr-1" />
                          WhatsApp
                        </Button>
                        <Link href={`/interventions/${request.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:bg-primary/10"
                            title="Modifica Intervento"
                          >
                            <Edit size={14} />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(request.id)}
                          className="h-8 w-8 text-danger hover:bg-danger/10"
                          title="Elimina Intervento"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <Toaster />
    </div>
  );
};