"use client";

import React, { useMemo, useState } from 'react';
import { Plus, Search, Trash2, PencilLine, Tag } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

import { useSystemTypes } from '@/context/system-type-context';
import type { SystemType } from '@/types/system-type';

function UpsertDialog({
  mode,
  initial,
  onSave,
}: {
  mode: 'create' | 'edit';
  initial?: SystemType;
  onSave: (name: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initial?.name || '');
  const [saving, setSaving] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setName(initial?.name || '');
      }}
    >
      <DialogTrigger asChild>
        {mode === 'create' ? (
          <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Tipo
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl hover:bg-primary/10 hover:text-primary"
          >
            <PencilLine className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Tag className="h-4 w-4" />
            </span>
            {mode === 'create' ? 'Nuovo Tipo Impianto' : 'Modifica Tipo Impianto'}
          </DialogTitle>
          <DialogDescription>
            Inserisci solo il nome. Potrai usarlo poi nei Punti di Servizio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="system-type-name">Nome</Label>
          <Input
            id="system-type-name"
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
            onClick={() => setOpen(false)}
            type="button"
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
            {saving ? 'Salvataggio…' : 'Salva'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SystemTypeManager() {
  const { systemTypes, loading, addSystemType, updateSystemType, deleteSystemType } = useSystemTypes();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return systemTypes;
    return systemTypes.filter((s) => s.name.toLowerCase().includes(q));
  }, [query, systemTypes]);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Card className="rounded-2xl border bg-background/80 shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl">Anagrafica Tipo Impianto</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Crea e gestisci i tipi impianto (solo nome).
              </p>
            </div>
            <UpsertDialog mode="create" onSave={addSystemType} />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca tipo impianto…"
              className="rounded-xl pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-hidden rounded-2xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="w-[120px] text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="py-10 text-center text-sm text-muted-foreground">
                      Caricamento…
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="py-10 text-center text-sm text-muted-foreground">
                      {query ? 'Nessun risultato' : 'Nessun tipo impianto ancora creato'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row) => (
                    <TableRow key={row.id} className="hover:bg-primary/5">
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <UpsertDialog
                            mode="edit"
                            initial={row}
                            onSave={async (name) => {
                              await updateSystemType(row.id, name);
                            }}
                          />

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                              >
                                <Trash2 className="h-4 w-4" />
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
                                  onClick={async () => {
                                    try {
                                      await deleteSystemType(row.id);
                                    } catch (e) {
                                      toast.error('Errore durante l\'eliminazione');
                                    }
                                  }}
                                >
                                  Elimina
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
