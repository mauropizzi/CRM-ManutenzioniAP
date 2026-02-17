"use client";

import React from "react";
import Link from "next/link";

import {
  Edit,
  FileText,
  Filter,
  MapPin,
  MessageCircle,
  PlusCircle,
  Search,
  Trash2,
  Wrench,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useInterventionRequests } from "@/context/intervention-context";
import { useTechnicians } from "@/context/technician-context";
import { useSuppliers } from "@/context/supplier-context";
import type { InterventionRequest } from "@/types/intervention";

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

type StatusFilter = "all" | InterventionRequest["status"];

type AssignedFilter = "all" | "assigned" | "unassigned";

const normalize = (s?: string) => (s || "").trim().toLowerCase();

function getAssignedInfo(
  request: InterventionRequest,
  technicians: any[],
  suppliers: any[]
) {
  const techName = (request.assigned_technicians || "").trim();
  const supplierName = (request.assigned_supplier || "").trim();

  if (techName) {
    const match = technicians.find(
      (t) => normalize(`${t.first_name} ${t.last_name}`) === normalize(techName)
    );
    return {
      type: "technician" as const,
      name: techName,
      phone: match?.phone || "",
    };
  }

  if (supplierName) {
    const match = suppliers.find((s) => normalize(s.ragione_sociale) === normalize(supplierName));
    return {
      type: "supplier" as const,
      name: supplierName,
      phone: match?.telefono || "",
    };
  }

  return { type: "none" as const, name: "", phone: "" };
}

function toIntlWhatsAppNumber(raw?: string) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("39")) return digits;
  return `39${digits}`;
}

async function createPublicLink(interventionId: string) {
  const {
    data: { session },
    error: sessionErr,
  } = await supabase.auth.getSession();

  if (sessionErr) throw sessionErr;
  if (!session?.access_token) throw new Error("Sessione non valida. Effettua di nuovo il login.");

  const res = await fetch(
    "https://nrdsgtuzpnamcovuzghb.supabase.co/functions/v1/create-intervention-public-link",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ interventionId }),
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || "Impossibile generare il link pubblico");
  }

  const json = await res.json();
  const token = String(json?.token || "").trim();
  if (!token) throw new Error("Token non valido");
  return token;
}

function buildWhatsAppUrl(request: InterventionRequest, publicToken: string, assigned: ReturnType<typeof getAssignedInfo>) {
  if (assigned.type === "none") return null;

  const intl = toIntlWhatsAppNumber(assigned.phone);
  if (!intl) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://example.com";
  const link = `${origin}/public/interventions/${publicToken}`;

  const d = request.scheduled_date
    ? request.scheduled_date instanceof Date
      ? request.scheduled_date
      : new Date(request.scheduled_date as any)
    : null;

  const dateStr = d ? format(d, "dd/MM/yyyy", { locale: it }) : "N/D";
  const timeStr = request.scheduled_time ? ` ${request.scheduled_time}` : "";

  const intro =
    assigned.type === "technician"
      ? `Ciao ${assigned.name}, ti è stata assegnata una richiesta di intervento.`
      : `Buongiorno ${assigned.name}, è stata assegnata una richiesta di intervento.`;

  const text = [
    intro,
    `Cliente: ${request.client_company_name}`,
    `Impianto: ${request.system_type} ${request.brand} ${request.model}`,
    `Data/Ora: ${dateStr}${timeStr}`,
    `Apri la richiesta: ${link}`,
  ].join("\n");

  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}

function getStatusBadgeVariant(status: InterventionRequest["status"]) {
  switch (status) {
    case "Da fare":
      return "bg-warning/10 text-warning border-warning/20";
    case "In corso":
      return "bg-info/10 text-info border-info/20";
    case "Completato":
      return "bg-success/10 text-success border-success/20";
    case "Annullato":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-secondary text-secondary-foreground border-border";
  }
}

function getGoogleMapsLink(request: InterventionRequest) {
  const anyReq = request as any;
  const parts = [
    request.client_address,
    anyReq.client_citta,
    anyReq.client_cap,
    anyReq.client_provincia,
  ]
    .filter(Boolean)
    .join(", ");
  if (!parts) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(parts)}`;
}

export function InterventionTable() {
  const { interventionRequests, loading } = useInterventionRequests();
  const { technicians } = useTechnicians();
  const { suppliers } = useSuppliers();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [assignedFilter, setAssignedFilter] = React.useState<AssignedFilter>("all");

  const stats = React.useMemo(() => {
    const total = interventionRequests.length;
    const daFare = interventionRequests.filter((i) => i.status === "Da fare").length;
    const inCorso = interventionRequests.filter((i) => i.status === "In corso").length;
    const completati = interventionRequests.filter((i) => i.status === "Completato").length;
    return { total, daFare, inCorso, completati };
  }, [interventionRequests]);

  const filtered = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return interventionRequests.filter((r) => {
      const assigned = getAssignedInfo(r, technicians as any[], suppliers as any[]);

      const matchesSearch =
        !q ||
        (r.client_company_name || "").toLowerCase().includes(q) ||
        (r.system_type || "").toLowerCase().includes(q) ||
        (r.brand || "").toLowerCase().includes(q) ||
        (r.model || "").toLowerCase().includes(q) ||
        (r.client_address || "").toLowerCase().includes(q) ||
        (assigned.name || "").toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || r.status === statusFilter;

      const isAssigned = assigned.type !== "none";
      const matchesAssigned =
        assignedFilter === "all" || (assignedFilter === "assigned" ? isAssigned : !isAssigned);

      return matchesSearch && matchesStatus && matchesAssigned;
    });
  }, [interventionRequests, searchTerm, statusFilter, assignedFilter, technicians, suppliers]);

  const handleDelete = async (id: string) => {
    // Note: Delete functionality not yet implemented in context
    // await deleteInterventionRequest(id);
  };

  const handleWhatsAppClick = async (request: InterventionRequest) => {
    const assigned = getAssignedInfo(request, technicians as any[], suppliers as any[]);

    if (assigned.type === "none") {
      toast.error("Nessun tecnico o fornitore assegnato.");
      return;
    }

    if (!assigned.phone || !toIntlWhatsAppNumber(assigned.phone)) {
      toast.error(
        `Numero di telefono non disponibile per ${assigned.name}. Aggiorna l'anagrafica per inviare WhatsApp.`
      );
      return;
    }

    try {
      toast.loading("Sto preparando il messaggio WhatsApp…", { id: `wa-${request.id}` });
      const token = await createPublicLink(request.id);
      const url = buildWhatsAppUrl(request, token, assigned);

      if (!url) throw new Error("Impossibile generare il link WhatsApp.");

      toast.success("Messaggio pronto", { id: `wa-${request.id}` });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast.error(e?.message || "Errore durante la preparazione del messaggio", {
        id: `wa-${request.id}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Interventi</h2>
          <p className="text-text-secondary text-sm mt-1">
            Gestisci richieste, assegnazioni e bolla di lavoro
          </p>
        </div>
        <Link href="/interventions/new">
          <Button variant="default" className="gap-2">
            <PlusCircle size={18} />
            Nuova Richiesta
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Totale Interventi</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Da fare</p>
              <p className="text-2xl font-bold text-foreground">{stats.daFare}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center text-lg">
              🟡
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">In corso</p>
              <p className="text-2xl font-bold text-foreground">{stats.inCorso}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center text-lg">
              🔵
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Completati</p>
              <p className="text-2xl font-bold text-foreground">{stats.completati}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-lg">
              🟢
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
                placeholder="Cerca intervento…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="sm:w-44">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-text-secondary" />
                    <SelectValue placeholder="Stato" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="Da fare">Da fare</SelectItem>
                  <SelectItem value="In corso">In corso</SelectItem>
                  <SelectItem value="Completato">Completato</SelectItem>
                  <SelectItem value="Annullato">Annullato</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:w-44">
              <Select
                value={assignedFilter}
                onValueChange={(v) => setAssignedFilter(v as AssignedFilter)}
              >
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-text-secondary" />
                    <SelectValue placeholder="Assegnazione" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="assigned">Assegnati</SelectItem>
                  <SelectItem value="unassigned">Non assegnati</SelectItem>
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
                <Wrench className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Caricamento…</h3>
              <p className="text-text-secondary">Sto recuperando gli interventi</p>
            </div>
          </CardContent>
        ) : filtered.length === 0 ? (
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Wrench className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {interventionRequests.length === 0 ? "Nessun intervento trovato" : "Nessun risultato"}
              </h3>
              <p className="text-text-secondary mb-6">
                {interventionRequests.length === 0
                  ? "Crea la prima richiesta di intervento"
                  : "Prova a modificare i filtri di ricerca"}
              </p>
              {interventionRequests.length === 0 && (
                <Link href="/interventions/new">
                  <Button variant="default">Primo Intervento</Button>
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
                    Cliente
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[260px]">
                    Impianto
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[160px]">
                    Data/Ora
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[140px]">
                    Stato
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[220px]">
                    Assegnato
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[240px]">
                    Azioni
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-border">
                {filtered.map((request) => {
                  const assigned = getAssignedInfo(request, technicians as any[], suppliers as any[]);
                  const mapsHref = getGoogleMapsLink(request);

                  const d = request.scheduled_date
                    ? request.scheduled_date instanceof Date
                      ? request.scheduled_date
                      : new Date(request.scheduled_date as any)
                    : null;

                  return (
                    <TableRow key={request.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-sm flex-shrink-0">
                            👷
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-foreground truncate">
                              {request.client_company_name}
                            </div>
                            <div className="text-xs text-text-secondary truncate">
                              {request.client_address || "—"}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 sm:px-6 py-4">
                        <div className="text-sm font-medium text-foreground truncate">
                          {request.system_type} · {request.brand}
                        </div>
                        <div className="text-xs text-text-secondary truncate">{request.model || "—"}</div>
                      </TableCell>

                      <TableCell className="px-4 sm:px-6 py-4">
                        <div className="text-sm text-foreground">
                          {d ? format(d, "dd/MM/yyyy", { locale: it }) : "N/D"}
                          {request.scheduled_time ? ` • ${request.scheduled_time}` : ""}
                        </div>
                      </TableCell>

                      <TableCell className="px-4 sm:px-6 py-4">
                        <Badge
                          className={`rounded-full px-2.5 py-1 text-xs font-medium border ${getStatusBadgeVariant(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-4 sm:px-6 py-4">
                        {assigned.type === "none" ? (
                          <div className="text-sm text-text-secondary">Nessuno</div>
                        ) : (
                          <div>
                            <div className="text-sm font-medium text-foreground truncate">{assigned.name}</div>
                            <div className="text-xs text-text-secondary">
                              {assigned.type === "technician" ? "Tecnico" : "Fornitore"}
                            </div>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/interventions/${request.id}/work-report`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary hover:bg-primary/10 flex-shrink-0"
                              title="Bolla di lavoro"
                            >
                              <FileText size={14} />
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-success hover:bg-success/10 flex-shrink-0"
                            title="Invia WhatsApp"
                            onClick={() => void handleWhatsAppClick(request)}
                          >
                            <MessageCircle size={14} />
                          </Button>

                          {mapsHref ? (
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-success hover:bg-success/10 flex-shrink-0"
                              title="Naviga"
                            >
                              <a href={mapsHref} target="_blank" rel="noopener noreferrer">
                                <MapPin size={14} />
                              </a>
                            </Button>
                          ) : null}

                          <Link href={`/interventions/${request.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary hover:bg-primary/10 flex-shrink-0"
                              title="Modifica Intervento"
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
                                title="Elimina Intervento"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminare questo intervento?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Questa azione non può essere annullata.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Annulla</AlertDialogCancel>
                                <AlertDialogAction
                                  className="rounded-xl bg-red-600 text-white hover:bg-red-700"
                                  onClick={() => handleDelete(request.id)}
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