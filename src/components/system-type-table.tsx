"use client";

import React from 'react';
import { UpsertSystemTypeDialog } from './upsert-system-type-dialog';
import { useSystemTypes } from '@/context/system-type-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, PlusCircle, Edit, Trash2 } from 'lucide-react';

export const SystemTypeTable = () => {
  const { systemTypes, createSystemType, deleteSystemType } = useSystemTypes();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filtered = systemTypes.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Tipi Impianto</h2>
        <UpsertSystemTypeDialog mode="create" onSave={async (name) => createSystemType({ name } as any)} />
      </div>

      <Card>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary h-4 w-4" />
            <Input placeholder="Cerca tipo impianto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <UpsertSystemTypeDialog mode="edit" systemType={row} onSave={async (name) => createSystemType({ name } as any)} />
                      <Button variant="ghost" onClick={() => deleteSystemType(row.id)}>
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default SystemTypeTable;