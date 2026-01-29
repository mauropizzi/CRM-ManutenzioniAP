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
import { Edit, Trash2, PlusCircle, FileText } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export const InterventionTable = () => {
  const { interventionRequests, deleteInterventionRequest } = useInterventionRequests();

  const handleDeleteClick = (id: string) => {
    deleteInterventionRequest(id);
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
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Modello</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Data Prevista</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Stato</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 rounded-tr-md">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {interventionRequests.map((request: InterventionRequest) => (
                <TableRow key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{request.client_company_name}</TableCell>
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
                      {/* Link alla Bolla di Consegna */}
                      <Link href={`/interventions/${request.id}/work-report`} passHref>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-md text-green-700 border-green-600 hover:bg-green-50 dark:text-green-400 dark:border-green-500 dark:hover:bg-gray-700 flex items-center gap-1"
                        >
                          <FileText size={16} />
                          <span>Bolla</span>
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
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Toaster />
    </div>
  );
};