"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useServicePoint } from '@/context/service-point-context';
import { useCustomers } from '@/context/customer-context';
import { ServicePointProvider } from '@/context/service-point-context';
import { CustomerProvider } from '@/context/customer-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Plus, Edit, MapPin, Phone, Mail } from 'lucide-react';

function CustomerServicePointsContent() {
  const params = useParams();
  const router = useRouter();
  const { servicePoints, loading } = useServicePoint();
  const { customers } = useCustomers();
  
  const customer = customers.find((c: any) => c.id === params.id);
  const customerServicePoints = servicePoints.filter(sp => sp.customer_id === params.id);

  if (loading) {
    return <div>Caricamento...</div>;
  }

  if (!customer) {
    return <div>Cliente non trovato</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Punti Servizio - {customer.ragione_sociale}</h1>
          <p className="text-muted-foreground">Gestisci i punti servizio del cliente</p>
        </div>
        <Button onClick={() => router.push(`/service-points/new?customerId=${params.id}`)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuovo Punto Servizio
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Punti Servizio ({customerServicePoints.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {customerServicePoints.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Nessun punto servizio configurato per questo cliente</p>
              <Button onClick={() => router.push(`/service-points/new?customerId=${params.id}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Punto Servizio
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Indirizzo</TableHead>
                  <TableHead>Contatti</TableHead>
                  <TableHead>Impianti</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerServicePoints.map((point) => (
                  <TableRow key={point.id}>
                    <TableCell className="font-medium">{point.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {point.address && <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{point.address}</div>}
                        {(point.city || point.cap) && (
                          <div className="text-sm text-muted-foreground">
                            {[point.cap, point.city].filter(Boolean).join(' ')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {point.telefono && <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{point.telefono}</div>}
                        {point.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" />{point.email}</div>}
                      </div>
                    </TableCell>
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
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/service-points/${point.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CustomerServicePointsPage() {
  return (
    <ProtectedRoute>
      <CustomerProvider>
        <ServicePointProvider>
          <CustomerServicePointsContent />
        </ServicePointProvider>
      </CustomerProvider>
    </ProtectedRoute>
  );
}