"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useServicePoints } from '@/context/service-point-context';
import { useCustomers } from '@/context/customer-context';
import type { ServicePoint } from '@/types/service-point';
import { ServicePointProvider } from '@/context/service-point-context';
import { CustomerProvider } from '@/context/customer-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Plus, Edit, MapPin, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

function CustomerServicePointsContent() {
  const params = useParams();
  const router = useRouter();
  const { servicePoints, loading } = useServicePoints();
  const { customers } = useCustomers();
  
  const customer = customers.find((c: any) => c.id === params.id);
  const customerServicePoints = servicePoints.filter((sp: ServicePoint) => sp.customer_id === params.id);

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
                {customerServicePoints.map((point: ServicePoint) => (
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
                        {point.systems?.length === 0 ? (
                          <Badge variant="outline">Nessun impianto</Badge>
                        ) : (
                          point.systems?.map((system: any, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {system.system_type} - {system.brand}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Link href={`/service-points/${point.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                            [point.address, point.city, point.cap, point.provincia].filter(Boolean).join(', ')
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-md text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-gray-700 border border-transparent px-2 py-1 text-sm"
                        >
                          <MapPin className="h-4 w-4" />
                          <span className="ml-1 hidden sm:inline">Naviga</span>
                        </Link>
                      </div>
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