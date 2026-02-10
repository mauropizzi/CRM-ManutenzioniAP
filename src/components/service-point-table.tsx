"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useServicePoint } from '@/context/service-point-context';
import { useCustomers } from '@/context/customer-context';
import { ServicePointWithSystems } from '@/types/service-point';
import { Edit, Trash2, Plus, Search, MapPin, MapPinned } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ServicePointTable() {
  const router = useRouter();
  const { servicePoints, loading, deleteServicePoint } = useServicePoint();
  const { customers } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServicePoints = servicePoints.filter(point =>
    point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    point.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    point.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customers.find((c: any) => c.id === point.customer_id)?.ragione_sociale?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c: any) => c.id === customerId);
    return customer?.ragione_sociale || 'Cliente non trovato';
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteServicePoint(id);
      toast.success('Punto servizio eliminato con successo');
    } catch (error) {
      console.error('Error deleting service point:', error);
      toast.error('Errore durante l\'eliminazione del punto servizio');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="ds-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-foreground">Punti Servizio</h1>
          <p className="text-sm text-muted-foreground">Località e impianti associati</p>
        </div>
        <Button onClick={() => router.push('/service-points/new')} className="w-full sm:w-auto">
          <Plus className="ds-icon" />
          Nuovo Punto Servizio
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca punto servizio o cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 ds-input"
        />
      </div>

      {filteredServicePoints.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-[14px] border border-dashed">
          <MapPinned className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Nessun punto servizio trovato.</p>
        </div>
      ) : (
        <div className="table-responsive rounded-[14px] border border-border/50">
          <Table className="table-compact">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Indirizzo</TableHead>
                <TableHead>Impianti</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServicePoints.map((point) => (
                <TableRow key={point.id}>
                  <TableCell className="font-medium">{point.name}</TableCell>
                  <TableCell>
                    <span className="text-sm">{getCustomerName(point.customer_id)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span>{point.address || '-'}</span>
                      <span className="text-muted-foreground">{point.city || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {point.systems.length === 0 ? (
                        <span className="text-xs text-muted-foreground italic">Nessun impianto</span>
                      ) : (
                        point.systems.map((system, index) => (
                          <Badge key={index} variant="secondary" className="text-[10px] border-none bg-primary/5 text-primary">
                            {system.system_type}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/service-points/${point.id}/edit`)}
                        title="Modifica"
                      >
                        <Edit className="ds-icon text-muted-foreground" />
                      </Button>

                      { (point.address || point.city || point.cap || point.provincia) && (
                        <Button variant="ghost" size="icon" asChild title="Naviga">
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                              [point.address, point.city, point.cap, point.provincia].filter(Boolean).join(', ')
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MapPin className="ds-icon text-green-600" />
                          </a>
                        </Button>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Elimina">
                            <Trash2 className="ds-icon text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-[16px]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Questa azione eliminerà permanentemente il punto servizio "{point.name}" e tutti i suoi impianti associati.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-[12px]">Annulla</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(point.id)} className="rounded-[12px] bg-destructive text-white hover:bg-destructive/90">
                              Elimina
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}