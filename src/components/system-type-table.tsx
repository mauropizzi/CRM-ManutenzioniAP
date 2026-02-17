"use client";

import React from 'react';
import { useSystemTypes } from '@/context/system-type-context';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, PlusCircle, Edit, Trash2 } from 'lucide-react';

export const SystemTypeTable = () => {
  const { systemTypes, createSystemType, deleteSystemType, updateSystemType } = useSystemTypes();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filtered = systemTypes.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Tipi Impianto</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Nuovo Tipo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuovo Tipo Impianto</DialogTitle>
            </DialogHeader>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              const name = formData.get('name') as string;
              if (name) {
                await createSystemType({ name });
              }
            }} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Tipo</Label>
                <Input id="name" name="name" placeholder="Inserisci il nome del tipo" required />
              </div>
              <Button type="submit">Salva</Button>
            </form>
          </DialogContent>
        </Dialog>
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifica Tipo Impianto</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const formData = new FormData(form);
                            const name = formData.get('name') as string;
                            if (name) {
                              await updateSystemType(row.id, { name });
                            }
                          }} className="space-y-4">
                            <div>
                              <Label htmlFor="name">Nome Tipo</Label>
                              <Input id="name" name="name" defaultValue={row.name} required />
                            </div>
                            <Button type="submit">Aggiorna</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
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