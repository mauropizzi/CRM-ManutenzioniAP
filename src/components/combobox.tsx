"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ComboboxProps {
  label?: string;
  placeholder?: string;
  value?: { id?: string; name: string } | null;
  onChange: (val: { id?: string; name: string } | null) => void;
  fetchItems: () => Promise<{ id: string; name: string }[]>;
  createItem: (name: string) => Promise<{ id: string; name: string }>;
}

export const Combobox: React.FC<ComboboxProps> = ({
  label,
  placeholder,
  value,
  onChange,
  fetchItems,
  createItem,
}) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<{ id: string; name: string }[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchItems().then(setItems).catch(() => {});
  }, [fetchItems]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(i => i.name.toLowerCase().includes(q));
  }, [items, query]);

  const handleCreate = async () => {
    const name = query.trim();
    if (!name) return;
    const created = await createItem(name);
    setItems(prev => {
      const exists = prev.some(p => p.id === created.id);
      return exists ? prev : [...prev, created];
    });
    onChange(created);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="space-y-2">
      {label && <div className="text-sm font-medium">{label}</div>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between rounded-md">
            <span>{value?.name || placeholder || 'Seleziona...'}</span>
            <Badge variant="secondary">{filtered.length}</Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 space-y-2">
          <Input
            placeholder="Cerca o digita per creare"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="max-h-48 overflow-auto space-y-1">
            {filtered.map((i) => (
              <Button
                key={i.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onChange(i);
                  setOpen(false);
                  setQuery('');
                }}
              >
                {i.name}
              </Button>
            ))}
            {filtered.length === 0 && (
              <div className="text-sm text-muted-foreground">Nessun risultato</div>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={handleCreate} disabled={!query.trim()}>
              Crea "{query.trim()}"
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};