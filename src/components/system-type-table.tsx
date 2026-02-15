"use client";

import React from "react";
import { Edit, Filter, PlusCircle, Search, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useSystemTypes } from "@/context/system-type-context";
import type { SystemType } from "@/types/system-type";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type OrderFilter = "all" | "ordered" | "unordered";

function getOrderVariant(sortOrder?: number | null) {
  if (typeof sortOrder === "number") {
    return "bg-primary/10 text-primary border-primary/20";
  }
  return "bg-secondary text-secondary-foreground border-border";
}

function getOrderIcon(sortOrder?: number | null) {
  return typeof sortOrder === "number" ? "🔢" : "📝";
}

function UpsertSystemTypeDialog({
  mode,
  initial,
  onSave,
}: {
  mode: "create" | "edit";
  initial?: SystemType;
  onSave: (name: string) => Promise<void>;
}) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(initial?.name ?? "");
  const [saving, setSaving] = React.useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setName(initial?.name ?? "");
      }}
    >
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button variant="default" className="gap-2">
            <PlusCircle size={18} />
            Aggiungi Tipo
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary hover:bg-primary/10 flex-shrink-0"
            title="Modifica Tipo"
          >
            <Edit size={14} />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {mode === "create" ? "Nuovo Tipo Impianto" : "Modifica Tipo Impianto"}
          </DialogTitle>
          <DialogDescription>
            Inserisci il nome del tipo impianto. Potrai usarlo nei Punti di Servizio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor={mode === "create" ? "system-type-new" : `system-type-${initial?.id ?? "edit"}`}>
            Nome
          </Label>
          <Input
            id={mode === "create" ? "system-type-new" : `system-type-${initial?.id ?? "edit"}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Es. Caldaia, Climatizzatore, Fotovoltaico"
            className="rounded-xl"
          />
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            className="rounded-xl"
            type="button"
            onClick={() => setOpen(false)}
          >
            Annulla
          </Button>
          <Button
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await onSave(name);
                setOpen(false);
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Salvataggio…" : "Salva"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SystemTypeTable() {
  const { systemTypes, loading, addSystemType, updateSystemType, deleteSystemType } = useSystemTypes();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [orderFilter, setOrderFilter] = React.useState<OrderFilter>("all");

  const stats = React.useMemo(() => {
    const ordered = systemTypes.filter((s) => typeof s.sort_order === "number").length;
    const unordered = systemTypes.length - ordered;
    return {
      total: systemTypes.length,
      ordered,
      unordered,
    };
  }, [systemTypes]);

  const filteredSystemTypes = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return systemTypes.filter((row) => {
      const matchesSearch = !q || row.name.toLowerCase().includes(q);
      const hasOrder = typeof row.sort_order === "number";
      const matchesOrder =
        orderFilter === "all" || (orderFilter === "ordered" ? hasOrder : !hasOrder);

      return matchesSearch && matchesOrder;
    });
  }, [systemTypes, searchTerm, orderFilter]);

  const handleDeleteClick = async (id: string) => {
    try {
      await deleteSystemType(id);
    } catch {
      toast.error("Errore durante l'eliminazione");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tipo Impianto</h2>
          <p className="text-text-secondary text-sm mt-1">
            Gestisci l'anagrafica dei tipi impianto per clienti e punti di servizio
          </p>
        </div>
        <UpsertSystemTypeDialog mode="create" onSave={addSystemType} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Totale Tipi</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Tag className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Con ordine</p>
              <p className="text-2xl font-bold text-foreground">{stats.ordered}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
              🔢
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Senza ordine</p>
              <p className="text-2xl font-bold text-foreground">{stats.unordered}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-lg">
              📝
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">In elenco</p>
              <p className="text-2xl font-bold text-foreground">{filteredSystemTypes.length}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-lg">
              📋
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
                placeholder="Cerca tipo impianto…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="sm:w-44">
              <Select value={orderFilter} onValueChange={(v) => setOrderFilter(v as OrderFilter)}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-text-secondary" />
                    <SelectValue placeholder="Ordine" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="ordered">
                    <div className="flex items-center gap-2">
                      <span>🔢</span>
                      <span>Con ordine</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="unordered">
                    <div className="flex items-center gap-2">
                      <span>📝</span>
                      <span>Senza ordine</span>
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
                <Tag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Caricamento…</h3>
              <p className="text-text-secondary">Sto recuperando i tipi impianto</p>
            </div>
          </CardContent>
        ) : filteredSystemTypes.length === 0 ? (
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Tag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {systemTypes.length === 0 ? "Nessun tipo trovato" : "Nessun risultato"}
              </h3>
              <p className="text-text-secondary mb-6">
                {systemTypes.length === 0
                  ? "Aggiungi il primo tipo impianto"
                  : "Prova a modificare i filtri di ricerca"}
              </p>
              {systemTypes.length === 0 && (
                <UpsertSystemTypeDialog mode="create" onSave={addSystemType} />
              )}
            </div>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[260px]">
                    Nome
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[120px]">
                    Ordine
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[200px]">
                    Azioni
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {filteredSystemTypes.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-sm flex-shrink-0">
                          {getOrderIcon(row.sort_order)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-foreground truncate">{row.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 sm:px-6 py-4">
                      <Badge
                        className={`rounded-full px-2.5 py-1 text-xs font-medium border ${getOrderVariant(
                          row.sort_order
                        )}`}
                      >
                        <div className="flex items-center gap-1">
                          <span>{getOrderIcon(row.sort_order)}</span>
                          <span>{typeof row.sort_order === "number" ? row.sort_order : "—"}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 sm:px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <UpsertSystemTypeDialog
                          mode="edit"
                          initial={row}
                          onSave={async (name) => updateSystemType(row.id, name)}
                        />

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-danger hover:bg-danger/10 flex-shrink-0"
                              title="Elimina Tipo"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminare "{row.name}"?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Questa azione non può essere annullata.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">Annulla</AlertDialogCancel>
                              <AlertDialogAction
                                className="rounded-xl bg-red-600 text-white hover:bg-red-700"
                                onClick={() => handleDeleteClick(row.id)}
                              >
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
      </Card>
    </div>
  );
}
