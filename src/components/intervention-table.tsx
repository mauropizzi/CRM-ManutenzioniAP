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
import { InterventionRequest } from '@/types/intervention';
import { useInterventionRequests } from '@/context/intervention-context';
import { Edit, Trash2, PlusCircle, FileText, MessageCircle, MapPin, Wrench } from 'lucide-react';

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
      const match = suppliers.find((s) => normalize(s.ragione_sociale) === normalize(supplierName));
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
      `Impianto: ${request.system_type} ${request.brand} ${request.model}`,
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
      toast.error(`Numero di telefono non disponibile per ${assigned.name}. Aggiorna l'anagrafica per inviare WhatsApp.`);
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
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200';
      case 'In corso':
        return 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary';
      case 'Completato':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200';
      case 'Annullato':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getGoogleMapsLink = (request: InterventionRequest) => {
    const parts = [request.client_address, (request as any).client_citta, (request as any).client_cap, (request as any).client_provincia]
      .filter(Boolean)
      .join(', ');
    if (!parts) return null;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(parts)}`;
  };

  return (
    <div className="ds-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-foreground">Interventi</h1>
          <p className="text-sm text-muted-foreground">Gestione delle richieste e pianificazione</p>
        </div>

        <Link href="/interventions/new" passHref>
          <Button variant="default" className="w-full sm:w-auto">
            <PlusCircle className="ds-icon" />
            <span>Nuova Richiesta</span>
          </Button>
        </Link>
      </div>

      {interventionRequests.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-[14px] border border-dashed">
          <Wrench className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Nessuna richiesta trovata. Inizia creandone una nuova.</p>
        </div>
      ) : (
        <div className="table-responsive rounded-[14px] border border-border/50">
          <Table className="table-compact">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[200px]">Cliente</TableHead>
                <TableHead>Impianto</TableHead>
                <TableHead>Data Prevista</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Assegnato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interventionRequests.map((request: InterventionRequest) => {
                const assigned = getAssignedInfo(request);
                return (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.client_company_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{request.system_type}</span>
                        <span className="text-xs text-muted-foreground">{request.brand} {request.model}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span>{request.scheduled_date ? format(new Date(request.scheduled_date), 'dd MMM yyyy', { locale: it }) : 'N/D'}</span>
                        <span className="text-muted-foreground text-xs">{request.scheduled_time}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn("rounded-full border-none px-3", getStatusBadgeClass(request.status))}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {assigned.type === 'none' ? (
                        <span className="text-xs text-muted-foreground">Non assegnato</span>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{assigned.name}</span>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {assigned.type === 'technician' ? 'Tecnico' : 'Fornitore'}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/interventions/${request.id}/work-report`} passHref>
                          <Button variant="ghost" size="icon" title="Bolla">
                            <FileText className="ds-icon text-primary" />
                          </Button>
                        </Link>
                        
                        {(() => {
                          const maps = getGoogleMapsLink(request);
                          if (!maps) return null;
                          return (
                            <Button variant="ghost" size="icon" asChild title="Naviga">
                              <a href={maps} target="_blank" rel="noopener noreferrer">
                                <MapPin className="ds-icon text-green-600" />
                              </a>
                            </Button>
                          );
                        })()}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => void handleWhatsAppClick(request)}
                          title="WhatsApp"
                        >
                          <MessageCircle className="ds-icon text-emerald-600" />
                        </Button>
                        
                        <Link href={`/interventions/${request.id}/edit`} passHref>
                          <Button variant="ghost" size="icon" title="Modifica">
                            <Edit className="ds-icon text-muted-foreground" />
                          </Button>
                        </Link>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(request.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="ds-icon" />
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