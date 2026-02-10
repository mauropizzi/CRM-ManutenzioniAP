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
import { Plus, Edit, MapPin, Phone, Mail, MapPinned } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

function CustomerServicePointsContent() {
  const params = useParams();
  const router = useRouter();
  const { servicePoints, loading } = useServicePoint();
  const { customers } = useCustomers();
  
  const customer = customers.find((c: any) => c.id === params.id);
  const customerServicePoints = servicePoints.filter(sp => sp.customer_id === params.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="ds-card text-center py-12">
        <p className="text-muted-foreground">Cliente non trovato</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-foreground">Punti Servizio - {customer.ragione_sociale}</h1>
          <p className="text-sm text-muted-foreground">Gestisci i punti servizio del cliente</p>
        </div>
        <Button onClick={() => router.push(`/service-points/new?customerId=${params.id}`)} className="w-full sm:w-auto">
          <Plus className="ds-icon" />
          Nuovo Punto Servizio
        </Button>
      </div>

      <div className="ds-card">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Elenco Punti ({customerServicePoints.length})</h2>
        </div>

        {customerServicePoints.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-[14px] border border-dashed">
            <MapPinned className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-6">Nessun punto servizio configurato per questo cliente</p>
            <Button onClick={() => router.push(`/service-points/new?customerId=${params.id}`)} variant="outline">
              <Plus className="ds-icon" />
              Aggiungi Punto Servizio
            </Button>
          </div>
        ) : (
          <div className="table-responsive rounded-[14px] border border-border/50">
            <Table className="table-compact">
              <TableHeader className="bg-muted/50">
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
                      <div className="flex flex-col text-xs">
                        {point.address && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-primary" />
                            {point.address}
                          </div>
                        )}
                        {(point.city || point.cap) && (
                          <span className="text-muted-foreground ml-4">
                            {[point.cap, point.city].filter(Boolean).join(' ')}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs gap-1">
                        {point.telefono && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {point.telefono}
                          </div>
                        )}
                        {point.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {point.email}
                          </div>
                        )}
                        {!point.telefono && !point.email && <span className="text-muted-foreground italic">Nessun contatto</span>}
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
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/service-points/${point.id}/edit`)}
                          title="Modifica"
                        >
                          <Edit className="ds-icon text-muted-foreground" />
                        </Button>
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerServicePointsPage() {
  return (
    <ProtectedRoute>
      <CustomerProvider>
        <ServicePointProvider>
          <div className="container-custom py-6">
            <CustomerServicePointsContent />
          </div>
        </ServicePointProvider>
      </CustomerProvider>
    </ProtectedRoute>
  );
}