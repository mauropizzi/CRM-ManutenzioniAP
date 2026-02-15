"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Users,
  Wrench,
  UserCog,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import { useCustomers } from "@/context/customer-context";
import { useInterventionRequests } from "@/context/intervention-context";
import { useMaterials } from "@/context/material-context";
import { useTechnicians } from "@/context/technician-context";
import { useSuppliers } from "@/context/supplier-context";

const statusBadgeClass = (status: string) => {
  switch (status) {
    case "Completato":
      return "bg-success/10 text-success border-success/20";
    case "In corso":
      return "bg-info/10 text-info border-info/20";
    case "Da fare":
      return "bg-warning/10 text-warning border-warning/20";
    case "Annullato":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export default function Home() {
  const { customers } = useCustomers();
  const { interventionRequests } = useInterventionRequests();
  const { materials } = useMaterials();
  const { technicians } = useTechnicians();
  const { suppliers } = useSuppliers();

  const stats = React.useMemo(() => {
    const totalInterventions = interventionRequests.length;
    const totalCustomers = customers.length;
    const totalMaterials = materials.length;

    const activeTechnicians = technicians.filter((t) => t.is_active).length;
    const activeSuppliers = suppliers.filter((s) => s.attivo !== false).length;

    return {
      totalInterventions,
      totalCustomers,
      totalMaterials,
      activeResources: activeTechnicians + activeSuppliers,
    };
  }, [customers.length, interventionRequests.length, materials.length, technicians, suppliers]);

  const recentInterventions = React.useMemo(() => {
    return interventionRequests.slice(0, 6);
  }, [interventionRequests]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
              <p className="text-text-secondary text-sm mt-1">
                Panoramica rapida e accesso immediato alle funzioni principali
              </p>
            </div>

            <Link href="/interventions/new">
              <Button variant="default" className="gap-2">
                <PlusCircle size={18} />
                Nuovo intervento
              </Button>
            </Link>
          </div>

          {/* Stats cards (stesso layout di Materiali) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Interventi</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalInterventions}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Clienti</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalCustomers}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-success" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Materiali</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalMaterials}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-info" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Risorse attive</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeResources}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <UserCog className="h-5 w-5 text-warning" />
                </div>
              </div>
            </Card>
          </div>

          {/* Quick actions + Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <Card className="lg:col-span-5 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Image
                      src="/nuovo-logo.jpeg"
                      alt="Antonelli & Zanni Refrigerazione"
                      width={96}
                      height={96}
                      className="h-10 w-10 rounded-xl object-cover"
                      priority
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-foreground">Azioni rapide</div>
                    <p className="text-sm text-text-secondary mt-0.5">
                      Crea nuovi elementi o vai alle anagrafiche in un click.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Link href="/customers/new" className="block">
                    <Button variant="outline" className="w-full justify-between rounded-xl">
                      Nuovo cliente
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/materials/new" className="block">
                    <Button variant="outline" className="w-full justify-between rounded-xl">
                      Nuovo materiale
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/technicians/new" className="block">
                    <Button variant="outline" className="w-full justify-between rounded-xl">
                      Nuovo tecnico
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/suppliers/new" className="block">
                    <Button variant="outline" className="w-full justify-between rounded-xl">
                      Nuovo fornitore
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-7 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-foreground">Interventi recenti</div>
                    <p className="text-sm text-text-secondary mt-0.5">
                      Ultimi interventi creati (apri la lista completa per i filtri avanzati).
                    </p>
                  </div>
                  <Link href="/interventions">
                    <Button variant="ghost" className="rounded-xl">
                      Vai
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div className="mt-4 space-y-2">
                  {recentInterventions.length === 0 ? (
                    <div className="rounded-xl border bg-muted/20 p-4 text-sm text-text-secondary">
                      Nessun intervento presente.
                    </div>
                  ) : (
                    recentInterventions.map((i) => (
                      <Link
                        key={i.id}
                        href={`/interventions/${i.id}/edit`}
                        className="block"
                      >
                        <div className="rounded-xl border bg-card/60 px-4 py-3 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-foreground truncate">
                                {i.client_company_name}
                              </div>
                              <div className="text-xs text-text-secondary truncate mt-0.5">
                                {i.system_type} • {i.brand} {i.model}
                              </div>
                            </div>
                            <Badge className={`rounded-full px-2.5 py-1 text-xs font-medium border ${statusBadgeClass(i.status)}`}>
                              {i.status}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
