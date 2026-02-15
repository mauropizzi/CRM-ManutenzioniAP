"use client";

import React from "react";
import Link from "next/link";

import {
  Building2,
  Edit,
  Filter,
  HardDrive,
  MapPin,
  PlusCircle,
  Search,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { useCustomers } from "@/context/customer-context";
import type { Customer } from "@/types/customer";

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

type ActiveFilter = "all" | "active" | "inactive";

type SystemFilter = "all" | "with" | "without";

function getNavigateUrl(customer: Customer) {
  const destination = [customer.indirizzo, customer.citta, customer.cap, customer.provincia]
    .filter(Boolean)
    .join(", ");
  if (!destination.trim()) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

function getActiveBadgeVariant(active: boolean) {
  return active
    ? "bg-success/10 text-success border-success/20"
    : "bg-destructive/10 text-destructive border-destructive/20";
}

function getSystemBadgeVariant(customer: Customer) {
  const hasSystem = Boolean(customer.system_type || customer.brand);
  return hasSystem
    ? "bg-primary/10 text-primary border-primary/20"
    : "bg-secondary text-secondary-foreground border-border";
}

export function CustomerTable() {
  const { customers, loading, deleteCustomer } = useCustomers();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState<ActiveFilter>("all");
  const [systemFilter, setSystemFilter] = React.useState<SystemFilter>("all");

  const stats = React.useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.attivo).length;
    const inactive = total - active;
    const withSystem = customers.filter((c) => Boolean(c.system_type || c.brand)).length;
    return {
      total,
      active,
      inactive,
      withSystem,
    };
  }, [customers]);

  const filteredCustomers = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return customers.filter((c) => {
      const matchesSearch =
        !q ||
        c.ragione_sociale.toLowerCase().includes(q) ||
        (c.referente || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.telefono || "").toLowerCase().includes(q) ||
        (c.indirizzo || "").toLowerCase().includes(q) ||
        (c.citta || "").toLowerCase().includes(q) ||
        (c.system_type || "").toLowerCase().includes(q) ||
        (c.brand || "").toLowerCase().includes(q);

      const matchesActive =
        activeFilter === "all" || (activeFilter === "active" ? c.attivo : !c.attivo);

      const hasSystem = Boolean(c.system_type || c.brand);
      const matchesSystem =
        systemFilter === "all" || (systemFilter === "with" ? hasSystem : !hasSystem);

      return matchesSearch && matchesActive && matchesSystem;
    });
  }, [customers, searchTerm, activeFilter, systemFilter]);

  const handleDeleteClick = async (id: string) => {
    try {
      await deleteCustomer(id);
    } catch (err) {
      console.error("[customer-table] Error deleting customer:", err);
      toast.error("Errore nell'eliminazione del cliente");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Clienti</h2>
          <p className="text-text-secondary text-sm mt-1">
            Gestisci l'anagrafica clienti, contatti e riferimenti
          </p>
        </div>
        <Link href="/customers/new">
          <Button variant="default" className="gap-2">
            <PlusCircle size={18} />
            Aggiungi Cliente
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Totale Clienti</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Attivi</p>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-lg">
              ✅
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Non Attivi</p>
              <p className="text-2xl font-bold text-foreground">{stats.inactive}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center text-lg">
              ⛔
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Con Impianto/Marca</p>
              <p className="text-2xl font-bold text-foreground">{stats.withSystem}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
              ⚙️
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
                placeholder="Cerca cliente…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="sm:w-44">
              <Select value={activeFilter} onValueChange={(v) => setActiveFilter(v as ActiveFilter)}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-text-secondary" />
                    <SelectValue placeholder="Stato" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="active">
                    <div className="flex items-center gap-2">
                      <span>✅</span>
                      <span>Attivi</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="inactive">
                    <div className="flex items-center gap-2">
                      <span>⛔</span>
                      <span>Non attivi</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:w-52">
              <Select value={systemFilter} onValueChange={(v) => setSystemFilter(v as SystemFilter)}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-text-secondary" />
                    <SelectValue placeholder="Impianto" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="with">
                    <div className="flex items-center gap-2">
                      <span>⚙️</span>
                      <span>Con impianto/marca</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="without">
                    <div className="flex items-center gap-2">
                      <span>—</span>
                      <span>Senza impianto</span>
                    </div>
                  </SelectItem>
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
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Caricamento…</h3>
              <p className="text-text-secondary">Sto recuperando i clienti</p>
            </div>
          </CardContent>
        ) : filteredCustomers.length === 0 ? (
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {customers.length === 0 ? "Nessun cliente trovato" : "Nessun risultato"}
              </h3>
              <p className="text-text-secondary mb-6">
                {customers.length === 0
                  ? "Aggiungi il primo cliente all'anagrafica"
                  : "Prova a modificare i filtri di ricerca"}
              </p>
              {customers.length === 0 && (
                <Link href="/customers/new">
                  <Button variant="default">Primo Cliente</Button>
                </Link>
              )}
            </div>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[260px]">
                    Ragione Sociale
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[200px]">
                    Impianto / Marca
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[240px]">
                    Indirizzo
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[220px]">
                    Contatti
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[120px]">
                    Attivo
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[220px]">
                    Azioni
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-border">
                {filteredCustomers.map((customer) => {
                  const navigateUrl = getNavigateUrl(customer);
                  const hasSystem = Boolean(customer.system_type || customer.brand);

                  return (
                    <TableRow key={customer.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-sm flex-shrink-0">
                            👤
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-foreground truncate">
                              {customer.ragione_sociale}
                            </div>
                            <div className="text-xs text-text-secondary truncate">
                              {customer.referente || "Nessun referente"}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 sm:px-6 py-4">
                        <Badge
                          className={`rounded-full px-2.5 py-1 text-xs font-medium border ${getSystemBadgeVariant(
                            customer
                          )}`}
                        >
                          <div className="flex items-center gap-1">
                            <span>{hasSystem ? "⚙️" : "—"}</span>
                            <span>{hasSystem ? "Presente" : "N/D"}</span>
                          </div>
                        </Badge>
                        {hasSystem && (
                          <div className="mt-2 space-y-1">
                            {customer.system_type ? (
                              <div className="flex items-center gap-1 text-xs text-text-secondary">
                                <HardDrive className="h-3.5 w-3.5 text-primary" />
                                <span className="truncate">{customer.system_type}</span>
                              </div>
                            ) : null}
                            {customer.brand ? (
                              <div className="flex items-center gap-1 text-xs text-text-secondary">
                                <Tag className="h-3.5 w-3.5 text-warning" />
                                <span className="truncate">{customer.brand}</span>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="px-4 sm:px-6 py-4">
                        <div className="text-sm text-foreground truncate">{customer.indirizzo || "—"}</div>
                        <div className="text-xs text-text-secondary truncate">
                          {customer.citta || "—"}
                          {customer.provincia ? ` (${customer.provincia})` : ""}
                        </div>
                      </TableCell>

                      <TableCell className="px-4 sm:px-6 py-4">
                        <div className="text-sm text-foreground truncate">{customer.telefono || "—"}</div>
                        <div className="text-xs text-text-secondary truncate">{customer.email || "—"}</div>
                      </TableCell>

                      <TableCell className="px-4 sm:px-6 py-4">
                        <Badge
                          className={`rounded-full px-2.5 py-1 text-xs font-medium border ${getActiveBadgeVariant(
                            customer.attivo
                          )}`}
                        >
                          <div className="flex items-center gap-1">
                            <span>{customer.attivo ? "✅" : "⛔"}</span>
                            <span>{customer.attivo ? "Sì" : "No"}</span>
                          </div>
                        </Badge>
                      </TableCell>

                      <TableCell className="px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/customers/${customer.id}/service-points`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary hover:bg-primary/10 flex-shrink-0"
                              title="Punti Servizio"
                            >
                              <Building2 size={14} />
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

                          <Link href={`/customers/${customer.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary hover:bg-primary/10 flex-shrink-0"
                              title="Modifica Cliente"
                            >
                              <Edit size={14} />
                            </Button>
                          </Link>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-danger hover:bg-danger/10 flex-shrink-0"
                                title="Elimina Cliente"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminare "{customer.ragione_sociale}"?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Questa azione non può essere annullata.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Annulla</AlertDialogCancel>
                                <AlertDialogAction
                                  className="rounded-xl bg-red-600 text-white hover:bg-red-700"
                                  onClick={() => handleDeleteClick(customer.id)}
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
