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
import { useTechnicians } from '@/context/technician-context';
import { useSuppliers } from '@/context/supplier-context';
import { Edit, Trash2, PlusCircle, FileText, MessageCircle } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';

const normalizeWhatsappPhone = (raw: string) => {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed) return null;

  // Keep digits only
  let digits = trimmed.replace(/[^0-9]/g, '');

  // Convert 00XX... to XX...
  if (digits.startsWith('00')) digits = digits.slice(2);

  // If it looks like an Italian number without country code, add 39.
  if (!digits.startsWith('39')) {
    if (digits.startsWith('0')) {
      digits = `39${digits}`;
    } else if (digits.length === 10) {
      digits = `39${digits}`;
    }
  }

  return digits.length >= 8 ? digits : null;
};

const buildWhatsappUrl = ({ phone, text }: { phone: string; text: string }) => {
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${phone}?text=${encoded}`;
};

const getPublicBaseUrl = () => {
  if (typeof window === 'undefined') return '';

  const { hostname, port, protocol } = window.location;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

  // In locale spesso il dev server NON espone HTTPS: forziamo http per evitare SSL_ERROR_RX_RECORD_TOO_LONG.
  if (isLocal) {
    return `http://${hostname}${port ? `:${port}` : ''}`;
  }

  // In produzione usiamo l'origin corrente (tipicamente https)
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
};

const getAssignee = (request: InterventionRequest) => {
  const tech = (request.assigned_technicians ?? '').trim();
  const supplier = (request.assigned_supplier ?? '').trim();

  if (tech) return { type: 'technician' as const, name: tech };
  if (supplier) return { type: 'supplier' as const, name: supplier };
  return null;
};

export const InterventionTable = () => {
  const { interventionRequests, deleteInterventionRequest } = useInterventionRequests();
  const { technicians } = useTechnicians();
  const { suppliers } = useSuppliers();

  const handleDeleteClick = (id: string) => {
    deleteInterventionRequest(id);
  };

  const handleWhatsapp = (request: InterventionRequest) => {
    const assignee = getAssignee(request);
    if (!assignee) {
      toast.error('Nessun tecnico/fornitore assegnato a questa richiesta.');
      return;
    }

    let phoneRaw: string | null | undefined = null;

    if (assignee.type === 'technician') {
      const match = technicians.find(
        (t) => `${t.first_name} ${t.last_name}`.trim() === assignee.name
      );
      phoneRaw = match?.phone;
    } else {
      const match = suppliers.find((s) => (s.ragione_sociale ?? '').trim() === assignee.name);
      phoneRaw = match?.telefono;
    }

    const phone = normalizeWhatsappPhone(String(phoneRaw ?? ''));
    if (!phone) {
      toast.error(
        `Numero WhatsApp non disponibile per ${assignee.type === 'technician' ? 'il tecnico' : 'il fornitore'} “${assignee.name}”.`
      );
      return;
    }

    const baseUrl = getPublicBaseUrl();
    const link = `${baseUrl}/interventions/${request.id}/edit`;

    const message = [
      `Richiesta intervento assegnata a te`,
      `Cliente: ${request.client_company_name}`,
      `Link richiesta: ${link}`,
    ].join('\n');

    const url = buildWhatsappUrl({ phone, text: message });
    window.open(url, '_blank', 'noopener,noreferrer');
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
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Assegnato a</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Tipo Impianto</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Marca</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Modello</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Data Prevista</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Stato</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 rounded-tr-md">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {interventionRequests.map((request: InterventionRequest) => {
                const assignee = getAssignee(request);
                return (
                  <TableRow key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{request.client_company_name}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {assignee ? (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{assignee.name}</span>
                          <Badge
                            className={
                              assignee.type === 'technician'
                                ? 'rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                                : 'rounded-full bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200'
                            }
                          >
                            {assignee.type === 'technician' ? 'Tecnico' : 'Fornitore'}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{request.system_type}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{request.brand}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{request.model}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {request.scheduled_date ? format(new Date(request.scheduled_date), 'dd/MM/yyyy', { locale: it }) : 'N/D'}
                      {request.scheduled_time && ` ${request.scheduled_time}`}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                      <Badge className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(request.status)}`}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {/* WhatsApp */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-md border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-300 dark:hover:bg-gray-700 flex items-center gap-1"
                          onClick={() => handleWhatsapp(request)}
                          title="Invia messaggio WhatsApp"
                        >
                          <MessageCircle size={16} />
                          <span>WhatsApp</span>
                        </Button>

                        {/* Link alla Bolla di Consegna */}
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
                        {/* Link per modificare l'intervento */}
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
      <Toaster />
    </div>
  );
};