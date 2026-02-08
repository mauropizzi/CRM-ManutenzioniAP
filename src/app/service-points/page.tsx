"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useCustomers } from "@/context/customer-context";
import { useServicePoints } from "@/context/service-point-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/protected-route";
import { Search, MapPin, Phone, Mail } from "lucide-react";

export default function ServicePointsListPage() {
  const { customers } = useCustomers();
  const { servicePoints, loading } = useServicePoints();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredServicePoints = useMemo(() => {
    if (!searchTerm) return servicePoints;
    
    const term = searchTerm.toLowerCase();
    return servicePoints.filter(sp => 
      sp.nome_punto_servizio?.toLowerCase().includes(term) ||
      sp.indirizzo?.toLowerCase().includes(term) ||
      sp.citta?.toLowerCase().includes(term) ||
      sp.telefono?.toLowerCase().includes(term) ||
      sp.email?.toLowerCase().includes(term)
    );
  }, [servicePoints, searchTerm]);

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.ragione_sociale || "Cliente Sconosciuto";
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Punti di Servizio
            </h1>
            <Button asChild>
              <Link href="/customers/new">
                Nuovo Punto Servizio
              </Link>
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cerca punti di servizio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredServicePoints.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <MapPin className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-center">
                  {searchTerm 
                    ? "Nessun punto di servizio trovato per la ricerca effettuata."
                    : "Nessun punto di servizio registrato."
                  }
                </p>
                {!searchTerm && (
                  <Button asChild className="mt-4">
                    <Link href="/customers/new">
                      Crea Primo Punto di Servizio
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServicePoints.map((servicePoint) => (
                <Card key={servicePoint.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      {servicePoint.nome_punto_servizio}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {getCustomerName(servicePoint.customer_id)}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {servicePoint.indirizzo && (
                        <p className="flex items-center gap-2">
                          <span className="font-medium">Indirizzo:</span>
                          {servicePoint.indirizzo}, {servicePoint.citta} {servicePoint.cap}
                        </p>
                      )}
                      {servicePoint.telefono && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {servicePoint.telefono}
                        </p>
                      )}
                      {servicePoint.email && (
                        <p className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {servicePoint.email}
                        </p>
                      )}
                    </div>

                    {(servicePoint.tipo_impianti && servicePoint.tipo_impianti.length > 0) && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Tipi Impianto:</p>
                        <div className="flex flex-wrap gap-1">
                          {servicePoint.tipo_impianti.map((tipo, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tipo}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {(servicePoint.marche && servicePoint.marche.length > 0) && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Marche:</p>
                        <div className="flex flex-wrap gap-1">
                          {servicePoint.marche.map((marca, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {marca}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/customers/${servicePoint.customer_id}/service-points/${servicePoint.id}/edit`}>
                          Modifica
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}