"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Filter, MapPin, PlusCircle, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { useServicePoint } from "@/context/service-point-context";
import { useCustomers } from "@/context/customer-context";
import type { ServicePointWithSystems } from "@/types/service-point";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function getNavigateUrl(point: ServicePointWithSystems) {
  const destination = [point.address, point.city, point.cap, point.provincia]
    .filter(Boolean)
    .join(", ");
  if (!destination) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

function getSystemsBadgeVariant(count: number) {
  if (count === 0) return "bg-secondary text-secondary-foreground border-border";
  if (count === 1) return "bg-primary/10 text-primary border-primary/20";
  return "bg-success/10 text-success border-success/20";
}

export default function ServicePointTable() {
  const router = useRouter();
  const { servicePoints, loading, deleteServicePoint } = useServicePoint();
  const { customers } = useCustomers();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [customerFilter, setCustomerFilter] = React.useState<string>("all");

  const customerNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const c of customers as any[]) {
      map.set(c.id, c.ragione_sociale || "");
    }
    return map;
  }, [customers]);

  const customerOptions = React.useMemo(() => {
    const list = (customers as any[])
      .map((c) => ({ id: c.id as string, name: (c.ragione_sociale as string) || "" }))
      .filter((c) => c.id && c.name)
      .sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [customers]);

  const filteredServicePoints = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return servicePoints.filter((point: ServicePoint) => {
      const customerName = (customerNameById.get(point.customer_id) || "").toLowerCase();
      const matchesSearch =
        !q ||
        point.name.toLowerCase().includes(q) ||
        (point.address || "").toLowerCase().includes(q) ||
        (point.city || "").toLowerCase().includes(q) ||
        customerName.includes(q);

      const matchesCustomer = customerFilter === "all" || point.customer_id === customerFilter;

      return matchesSearch && matchesCustomer;
    });
  }, [servicePoints, searchTerm, customerFilter, customerNameById]);

  const stats = React.useMemo(() => {
    const total = servicePoints.length;
    const withSystems = servicePoints.filter((p: ServicePoint) => (p.systems?.length || 0) > 0).length;
    const withoutSystems = total - withSystems;
    const uniqueCustomers = new Set(servicePoints.map((p: ServicePoint) => p.customer_id).filter(Boolean)).size;

    return {
      total,
      withSystems,
      withoutSystems,
      uniqueCustomers,
    };
  }, [servicePoints]);

  const handleDelete = async (id: string) => {
    try {
      await deleteServicePoint(id);
      toast.success("Punto servizio eliminato");
    } catch (error) {
      console.error("[service-point-table] Error deleting service point:", error);
      toast.error("Errore durante l'eliminazione del punto servizio");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Punti di Servizio</h2>
          <p className="text-text-secondary text-sm mt-1">
            Gestisci sedi, indirizzi e impianti associati ai clienti
          </p>
        </div>
        <Button variant="default" className="gap-2" onClick={() => router.push("/service-points/new")}> 
          <PlusCircle size={18} />
          Aggiungi Punto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Totale Punti</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Con Impianti</p>
              <p className="text-2xl font-bold text-foreground">{stats.withSystems}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-lg">
              🏗️
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Senza Impianti</p>
              <p className="text-2xl font-bold text-foreground">{stats.withoutSystems}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-lg">
              🏠
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Clienti</p>
              <p className="text-2xl font-bold text-foreground">{stats.uniqueCustomers}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-4 w-4" />
              <Input
                placeholder="Cerca punto servizio…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="sm:w-64">
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-text-secondary" />
                    <SelectValue placeholder="Cliente" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i clienti</SelectItem>
                  {customerOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        {loading ? (
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Caricamento…</h3>
              <p className="text-text-secondary">Sto recuperando i punti di servizio</p>
            </div>
          </CardContent>
        ) : filteredServicePoints.length === 0 ? (
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {servicePoints.length === 0 ? "Nessun punto servizio trovato" : "Nessun risultato"}
              </h3>
              <p className="text-text-secondary mb-6">
                {servicePoints.length === 0
                  ? "Crea il primo punto di servizio per iniziare"
                  : "Prova a modificare i filtri di ricerca"}
              </p>
              {servicePoints.length === 0 && (
                <Button variant="default" onClick={() => router.push("/service-points/new")}> 
                  Primo Punto Servizio
                </Button>
              )}
            </div>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[240px]">
                    Punto Servizio
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[240px]">
                    Cliente
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[220px]">
                    Indirizzo
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[140px]">
                    Impianti
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[160px]">
                    Telefono
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[220px]">
                    Azioni
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-border">
                {filteredServicePoints.map((point: ServicePoint) => {
                  const customerName = customerNameById.get(point.customer_id) || "Cliente";
                  const systemsCount = point.systems?.length || 0;
                  const navigateUrl = getNavigateUrl(point);

                  return (
                    <TableRow key={point.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-sm flex-shrink-0">
                            📍
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-foreground truncate">{point.name}</div>
                            <div className="text-xs text-text-secondary truncate">
                              {(point.city || "").trim() || "—"}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 sm:px-6 py-4">
                        <div className="text-sm font-medium text-foreground truncate">{customerName}</div>
                      </TableCell>

                      <TableCell className="px-4 sm:px-6 py-4">
                        <div className="text-sm text-foreground truncate">
                          {[point.address, point.cap, point.city, point.provincia].filter(Boolean).join(", ") || "—"}
                        </div>
                      </TableCell>

                      <TableCell className="px-4 sm:px-6 py-4">
                        <Badge
                          className={`rounded-full px-2.5 py-1 text-xs font-medium border ${getSystemsBadgeVariant(
                            systemsCount
                          )}`}
                        >
                          <div className="flex items-center gap-1">
                            <span>{systemsCount === 0 ? "—" : "⚙️"}</span>
                            <span>{systemsCount}</span>
                          </div>
                        </Badge>
                        {systemsCount > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {point.systems.slice(0, 3).map((s: any, idx: number) => (
                              <Badge
                                key={`${point.id}-${idx}`}
                                className="rounded-full bg-muted text-foreground border border-border text-[11px]"
                              >
                                {s.system_type} · {s.brand}
                              </Badge>
                            ))}
                            {systemsCount > 3 && (
                              <Badge className="rounded-full bg-muted text-foreground border border-border text-[11px]">
                                +{systemsCount - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="px-4 sm:px-6 py-4">
                        <div className="text-sm text-foreground">{point.telefono || "—"}</div>
                      </TableCell>

                      <TableCell className="px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/service-points/${point.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary hover:bg-primary/10 flex-shrink-0"
                              title="Modifica Punto Servizio"
                            >
                              <Edit size={14} />
                            </Button>
                          </Link>

                          {navigateUrl ? (
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-success hover:bg-success/10 flex-shrink-0"
                              title="Naviga"
                            >
                              <a href={navigateUrl} target="_blank" rel="noopener noreferrer">
                                <MapPin size={14} />
                              </a>
                            </Button>
                          ) : null}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-danger hover:bg-danger/10 flex-shrink-0"
                                title="Elimina Punto Servizio"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminare "{point.name}"?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Questa azione eliminerà permanentemente il punto servizio e tutti i suoi impianti associati.
                                  Questa azione non può essere annullata.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Annulla</AlertDialogCancel>
                                <AlertDialogAction
                                  className="rounded-xl bg-red-600 text-white hover:bg-red-700"
                                  onClick={() => handleDelete(point.id)}
                                >
                                  Elimina
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}