"use client";

import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Search } from 'lucide-react';
import { WorkReportFormValues } from '@/components/work-report-form';
import { useMaterials } from '@/context/material-context';
import type { Material } from '@/types/material';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MaterialRowProps {
  index: number;
  onRemove: () => void;
  canRemove: boolean;
}

const UNITS = ['PZ', 'MT', 'KG', 'LT', 'NR'] as const;

const normalize = (s: string) => s.trim().toLowerCase();

const getSimilar = (query: string, materials: Material[]) => {
  const q = normalize(query);
  if (q.length < 3) return [];

  const tokens = q.split(/\s+/).filter(Boolean);

  const scored = materials
    .map((m) => {
      const d = normalize(m.description);
      let score = 0;
      if (d === q) score += 100;
      if (d.includes(q)) score += 40;
      for (const t of tokens) {
        if (t.length >= 3 && d.includes(t)) score += 8;
      }
      return { m, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((x) => x.m);

  return scored;
};

export const MaterialRow = ({ index, onRemove, canRemove }: MaterialRowProps) => {
  const { control, watch, setValue, getValues } = useFormContext<WorkReportFormValues>();
  const { materials } = useMaterials();

  const description = watch(`materials.${index}.description`) || '';
  const unit = watch(`materials.${index}.unit`) || 'PZ';
  const isNew = watch(`materials.${index}.is_new`);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogQuery, setDialogQuery] = useState('');
  const [mode, setMode] = useState<'search' | 'similar'>('search');

  const results = useMemo(() => {
    const q = dialogQuery || '';
    if (!q.trim()) return materials.slice(0, 20);
    return getSimilar(q, materials);
  }, [dialogQuery, materials]);

  const exactMatch = useMemo(() => {
    const q = normalize(description);
    if (!q) return null;
    return materials.find((m) => normalize(m.description) === q) ?? null;
  }, [description, materials]);

  // Se l'utente modifica manualmente la descrizione, resetta i flag
  useEffect(() => {
    const current = description;
    if (!current) {
      setValue(`materials.${index}.material_id`, '');
      setValue(`materials.${index}.is_new`, undefined);
      return;
    }

    // Se è un match esatto: aggancia automaticamente
    if (exactMatch) {
      setValue(`materials.${index}.material_id`, exactMatch.id);
      setValue(`materials.${index}.is_new`, false);
      setValue(`materials.${index}.unit`, exactMatch.unit);
    }
  }, [description, exactMatch, index, setValue]);

  const openSearch = () => {
    setMode('search');
    setDialogQuery(description);
    setDialogOpen(true);
  };

  const openSimilarPrompt = () => {
    setMode('similar');
    setDialogQuery(description);
    setDialogOpen(true);
  };

  const selectExisting = (m: Material) => {
    setValue(`materials.${index}.description`, m.description);
    setValue(`materials.${index}.unit`, m.unit);
    setValue(`materials.${index}.material_id`, m.id);
    setValue(`materials.${index}.is_new`, false);
    setDialogOpen(false);
  };

  const confirmNew = () => {
    // conferma che questo materiale (descrizione+UM) verrà aggiunto in anagrafica al salvataggio
    setValue(`materials.${index}.material_id`, '');
    setValue(`materials.${index}.is_new`, true);
    setDialogOpen(false);
  };

  const onBlurDescription = () => {
    const d = description.trim();
    if (!d) return;

    // Se già agganciato o già confermato nuovo, non disturbare
    const currentId = getValues(`materials.${index}.material_id`) as any;
    const currentIsNew = getValues(`materials.${index}.is_new`) as any;
    if (currentId || currentIsNew) return;

    if (exactMatch) return;

    const sim = getSimilar(d, materials);
    if (sim.length > 0) {
      openSimilarPrompt();
      return;
    }

    // Nessun simile: chiedi conferma nuovo
    openSimilarPrompt();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
      <div className="md:col-span-2">
        <FormField
          control={control}
          name={`materials.${index}.unit`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={`text-xs ${index > 0 ? 'sr-only' : ''}`}>U.M.</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? 'PZ'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="U.M." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>

      <div className="md:col-span-2">
        <FormField
          control={control}
          name={`materials.${index}.quantity`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={`text-xs ${index > 0 ? 'sr-only' : ''}`}>Quantità</FormLabel>
              <FormControl>
                <Input type="number" min="0" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="md:col-span-7">
        <FormField
          control={control}
          name={`materials.${index}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={`text-xs ${index > 0 ? 'sr-only' : ''}`}>Descrizione materiale</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input
                    placeholder="Descrizione (manuale o cerca in anagrafica)"
                    {...field}
                    onBlur={(e) => {
                      field.onBlur();
                      onBlurDescription();
                    }}
                  />
                </FormControl>
                <Button type="button" variant="outline" size="icon" onClick={openSearch} title="Cerca in anagrafica materiali">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {isNew ? (
                <p className="mt-1 text-xs text-blue-700">
                  Nuovo materiale: verrà aggiunto in anagrafica al salvataggio.
                </p>
              ) : null}

              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="md:col-span-1 flex justify-end">
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={18} />
          </Button>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[640px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {mode === 'search' ? 'Cerca materiale in anagrafica' : 'Materiale simile trovato'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'search'
                ? 'Seleziona un materiale esistente oppure conferma un nuovo inserimento.'
                : 'Abbiamo trovato descrizioni simili. Puoi usarne una oppure confermare il nuovo materiale.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              value={dialogQuery}
              onChange={(e) => setDialogQuery(e.target.value)}
              placeholder="Cerca descrizione…"
            />

            <div className="max-h-[260px] overflow-auto rounded-xl border">
              {results.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">Nessun risultato.</div>
              ) : (
                <div className="divide-y">
                  {results.map((m) => (
                    <div key={m.id} className="flex items-center justify-between gap-3 p-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{m.description}</div>
                        <div className="text-xs text-muted-foreground">U.M.: {m.unit}</div>
                      </div>
                      <Button type="button" variant="outline" onClick={() => selectExisting(m)}>
                        Usa
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Continua a modificare
            </Button>
            <Button type="button" onClick={confirmNew} className="bg-blue-600 hover:bg-blue-700">
              Conferma nuovo materiale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};