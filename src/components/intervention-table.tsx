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
import { Edit, Trash2, PlusCircle, FileText, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useTechnicians } from '@/context/technician-context';
import { useSuppliers } from '@/context/supplier-context';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'In corso':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Completato':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Annullato':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Richieste di Intervento</h2>
        <Link href="/interventions/new" passHref>
          <Button className="rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 flex items-center gap-2">
            <PlusCircle size={18} /> Nuova Richiesta
          </Button>
        </Link>
      </div>

      {interventionRequests.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nessuna richiesta di intervento trovata. Aggiungi una nuova richiesta per iniziare!</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
          <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 rounded-tl-md">Cliente</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Tipo Impianto</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Marca</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Data Prevista</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Stato</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Assegnato</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 rounded-tr-md">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {interventionRequests.map((request: InterventionRequest) => {
                const assigned = getAssignedInfo(request);
                return (
                  <TableRow key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{request.client_company_name}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{request.system_type}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{request.brand}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {request.scheduled_date ? format(new Date(request.scheduled_date), 'dd/MM/yyyy', { locale: it }) : 'N/D'}
                      {request.scheduled_time && ` ${request.scheduled_time}`}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                      <Badge className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(request.status)}`}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {assigned.type === 'none' ? (
                        <span className="text-gray-500 dark:text-gray-400">Nessuno</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100">{assigned.name}</span>
                          <Badge
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              assigned.type === 'technician'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                            }`}
                          >
                            {assigned.type === 'technician' ? 'Tecnico' : 'Fornitore'}
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link href={`/interventions/${request.id}/work-report`} passHref>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-md text-green-700 border-green-600 hover:bg-green-50 dark:text-green-400 dark:border-green-500 dark:hover:bg-gray-700 flex items-center gap-1"
                            title="Bolla di Consegna"
                          >
                            <FileText size={16} />
                            <span>Bolla</span>
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleWhatsAppClick(request)}
                          className="rounded-md text-emerald-700 border-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-500 dark:hover:bg-gray-700 flex items-center gap-1"
                          title="Invia WhatsApp"
                        >
                          <MessageCircle size={16} />
                          <span>WhatsApp</span>
                        </Button>
                        <Link href={`/interventions/${request.id}/edit`} passHref>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-md text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700"
                            title="Modifica Intervento"
                          >
                            <Edit size={18} />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(request.id)}
                          className="rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
                          title="Elimina Intervento"
                        >
                          <Trash2 size={18} />
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
    </div>
  );
};