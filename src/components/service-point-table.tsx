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
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

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
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Caricamento...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Punti Servizio</CardTitle>
          <Button onClick={() => router.push('/service-points/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Punto Servizio
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca punto servizio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Indirizzo</TableHead>
              <TableHead>Città</TableHead>
              <TableHead>Impianti</TableHead>
              <TableHead>Telefono</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServicePoints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {searchTerm ? 'Nessun punto servizio trovato' : 'Nessun punto servizio disponibile'}
                </TableCell>
              </TableRow>
            ) : (
              filteredServicePoints.map((point) => (
                <TableRow key={point.id}>
                  <TableCell className="font-medium">{point.name}</TableCell>
                  <TableCell>{getCustomerName(point.customer_id)}</TableCell>
                  <TableCell>{point.address || '-'}</TableCell>
                  <TableCell>{point.city || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {point.systems.length === 0 ? (
                        <Badge variant="outline">Nessun impianto</Badge>
                      ) : (
                        point.systems.map((system, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {system.system_type} - {system.brand}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{point.phone || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/service-points/${point.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Questa azione eliminerà permanentemente il punto servizio "{point.name}" e tutti i suoi impianti associati. Questa azione non può essere annullata.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(point.id)}>
                              Elimina
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}