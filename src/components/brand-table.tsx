"use client";

import React from "react";
import { Edit, Filter, Factory, PlusCircle, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useBrands } from "@/context/brand-context";
import type { Brand } from "@/types/brand";

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

const RANGES = ["A-F", "G-L", "M-R", "S-Z"] as const;
type Range = (typeof RANGES)[number];

type RangeFilter = "all" | Range;

function getRangeForBrandName(name: string): Range {
  const first = (name.trim()[0] || "").toUpperCase();
  if (!first) return "S-Z";

  if (first >= "A" && first <= "F") return "A-F";
  if (first >= "G" && first <= "L") return "G-L";
  if (first >= "M" && first <= "R") return "M-R";
  return "S-Z";
}

function getRangeBadgeVariant(range: Range) {
  switch (range) {
    case "A-F":
      return "bg-primary/10 text-primary border-primary/20";
    case "G-L":
      return "bg-success/10 text-success border-success/20";
    case "M-R":
      return "bg-warning/10 text-warning border-warning/20";
    case "S-Z":
      return "bg-info/10 text-info border-info/20";
  }
}

function getRangeIcon(range: Range) {
  switch (range) {
    case "A-F":
      return "🔤";
    case "G-L":
      return "🗂️";
    case "M-R":
      return "🏷️";
    case "S-Z":
      return "📚";
  }
}

function UpsertBrandDialog({
  mode,
  initial,
  onSave,
}: {
  mode: "create" | "edit";
  initial?: Brand;
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
            Nuova Marca
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary hover:bg-primary/10 flex-shrink-0"
            title="Modifica Marca"
          >
            <Edit size={14} />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {mode === "create" ? "Nuova Marca" : "Modifica Marca"}
          </DialogTitle>
          <DialogDescription>
            Inserisci il nome della marca. Potrai usarla nei Punti di Servizio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor={mode === "create" ? "brand-new" : `brand-${initial?.id ?? "edit"}`}>
            Nome
          </Label>
          <Input
            id={mode === "create" ? "brand-new" : `brand-${initial?.id ?? "edit"}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Es. Daikin, Mitsubishi, Samsung"
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

export function BrandTable() {
  const { brands, loading, addBrand, updateBrand, deleteBrand } = useBrands();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [rangeFilter, setRangeFilter] = React.useState<RangeFilter>("all");

  const stats = React.useMemo(() => {
    const counts: Record<Range, number> = { "A-F": 0, "G-L": 0, "M-R": 0, "S-Z": 0 };
    for (const b of brands) counts[getRangeForBrandName(b.name)] += 1;
    return {
      total: brands.length,
      ...counts,
    };
  }, [brands]);

  const filteredBrands = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return brands.filter((brand) => {
      const matchesSearch = !q || brand.name.toLowerCase().includes(q);
      const range = getRangeForBrandName(brand.name);
      const matchesRange = rangeFilter === "all" || range === rangeFilter;
      return matchesSearch && matchesRange;
    });
  }, [brands, searchTerm, rangeFilter]);

  const handleDeleteClick = async (id: string) => {
    try {
      await deleteBrand(id);
    } catch {
      toast.error("Errore durante l'eliminazione");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Marche</h2>
          <p className="text-text-secondary text-sm mt-1">
            Gestisci l'anagrafica delle marche usate nei punti di servizio
          </p>
        </div>
        <UpsertBrandDialog mode="create" onSave={addBrand} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Totale Marche</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Factory className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        {(RANGES as readonly Range[]).map((range, idx) => {
          const bg =
            idx === 0
              ? "bg-primary/10"
              : idx === 1
                ? "bg-success/10"
                : idx === 2
                  ? "bg-warning/10"
                  : "bg-info/10";

          return (
            <Card key={range} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">{range}</p>
                  <p className="text-2xl font-bold text-foreground">{stats[range]}</p>
                </div>
                <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center text-lg`}>
                  {getRangeIcon(range)}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-4 w-4" />
              <Input
                placeholder="Cerca marca…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="sm:w-44">
              <Select value={rangeFilter} onValueChange={(v) => setRangeFilter(v as RangeFilter)}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-text-secondary" />
                    <SelectValue placeholder="Gruppo" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte</SelectItem>
                  {RANGES.map((r) => (
                    <SelectItem key={r} value={r}>
                      <div className="flex items-center gap-2">
                        <span>{getRangeIcon(r)}</span>
                        <span>{r}</span>
                      </div>
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
                <Factory className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Caricamento…</h3>
              <p className="text-text-secondary">Sto recuperando le marche</p>
            </div>
          </CardContent>
        ) : filteredBrands.length === 0 ? (
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Factory className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {brands.length === 0 ? "Nessuna marca trovata" : "Nessun risultato"}
              </h3>
              <p className="text-text-secondary mb-6">
                {brands.length === 0
                  ? "Aggiungi la prima marca all'anagrafica"
                  : "Prova a modificare i filtri di ricerca"}
              </p>
              {brands.length === 0 && (
                <UpsertBrandDialog mode="create" onSave={addBrand} />
              )}
            </div>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[240px]">
                    Nome
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[120px]">
                    Gruppo
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[200px]">
                    Azioni
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {filteredBrands.map((brand) => {
                  const range = getRangeForBrandName(brand.name);
                  return (
                    <TableRow key={brand.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-sm flex-shrink-0">
                            {getRangeIcon(range)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-foreground truncate">
                              {brand.name}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 sm:px-6 py-4">
                        <Badge
                          className={`rounded-full px-2.5 py-1 text-xs font-medium border ${getRangeBadgeVariant(range)}`}
                        >
                          <div className="flex items-center gap-1">
                            <span>{getRangeIcon(range)}</span>
                            <span>{range}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <UpsertBrandDialog
                            mode="edit"
                            initial={brand}
                            onSave={async (name) => updateBrand(brand.id, name)}
                          />

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-danger hover:bg-danger/10 flex-shrink-0"
                                title="Elimina Marca"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminare "{brand.name}"?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Questa azione non può essere annullata.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Annulla</AlertDialogCancel>
                                <AlertDialogAction
                                  className="rounded-xl bg-red-600 text-white hover:bg-red-700"
                                  onClick={() => handleDeleteClick(brand.id)}
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
