"use client";

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Material } from '@/types/material';
import { useMaterials } from '@/context/material-context';
import { Edit, Trash2, PlusCircle, Search, Filter, Eye, Package } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const MaterialTable = () => {
  const { materials, deleteMaterial } = useMaterials();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [unitFilter, setUnitFilter] = React.useState<string>('all');

  // Filtra i materiali in base al termine di ricerca e all'unità di misura
  const filteredMaterials = React.useMemo(() => {
    return materials.filter((material) => {
      const matchesSearch = 
        material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.unit.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesUnit = unitFilter === 'all' || material.unit === unitFilter;
      
      return matchesSearch && matchesUnit;
    });
  }, [materials, searchTerm, unitFilter]);

  // Ottieni tutte le unità di misura uniche per il filtro
  const uniqueUnits = React.useMemo(() => {
    const units = [...new Set(materials.map((m) => m.unit))];
    return units.sort();
  }, [materials]);

  const handleDeleteClick = (id: string) => {
    deleteMaterial(id);
  };

  const getUnitBadgeVariant = (unit: string) => {
    switch (unit) {
      case 'PZ':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'MT':
        return 'bg-success/10 text-success border-success/20';
      case 'KG':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'LT':
        return 'bg-info/10 text-info border-info/20';
      default:
        return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  const getUnitIcon = (unit: string) => {
    switch (unit) {
      case 'PZ':
        return '📦';
      case 'MT':
        return '📏';
      case 'KG':
        return '⚖️';
      case 'LT':
        return '🥤';
      default:
        return '📋';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Materiali e Ricambi</h2>
          <p className="text-text-secondary text-sm mt-1">
            Gestisci il catalogo dei materiali utilizzati negli interventi
          </p>
        </div>
        <Link href="/materials/new">
          <Button variant="default" className="gap-2">
            <PlusCircle size={18} />
            Aggiungi Materiale
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Totale Materiali</p>
              <p className="text-2xl font-bold text-foreground">{materials.length}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Pezzi</p>
              <p className="text-2xl font-bold text-foreground">
                {materials.filter(m => m.unit === 'PZ').length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
              📦
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Metri</p>
              <p className="text-2xl font-bold text-foreground">
                {materials.filter(m => m.unit === 'MT').length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-lg">
              📏
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Altri</p>
              <p className="text-2xl font-bold text-foreground">
                {materials.filter(m => !['PZ', 'MT'].includes(m.unit)).length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-lg">
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
                placeholder="Cerca materiale..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="sm:w-40">
              <Select value={unitFilter} onValueChange={setUnitFilter}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-text-secondary" />
                    <SelectValue placeholder="Unità" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le unità</SelectItem>
                  {uniqueUnits.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      <div className="flex items-center gap-2">
                        <span>{getUnitIcon(unit)}</span>
                        <span>{unit}</span>
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
        {filteredMaterials.length === 0 ? (
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {materials.length === 0 ? 'Nessun materiale trovato' : 'Nessun risultato'}
              </h3>
              <p className="text-text-secondary mb-6">
                {materials.length === 0 
                  ? 'Aggiungi il primo materiale al catalogo' 
                  : 'Prova a modificare i filtri di ricerca'
                }
              </p>
              {materials.length === 0 && (
                <Link href="/materials/new">
                  <Button variant="default">Primo Materiale</Button>
                </Link>
              )}
            </div>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[200px]">
                    Descrizione
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[100px]">
                    Unità
                  </TableHead>
                  <TableHead className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider min-w-[200px]">
                    Azioni
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {filteredMaterials.map((material: Material) => (
                  <TableRow key={material.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-sm flex-shrink-0">
                          {getUnitIcon(material.unit)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-foreground truncate">
                            {material.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 sm:px-6 py-4">
                      <Badge 
                        className={`rounded-full px-2.5 py-1 text-xs font-medium border ${getUnitBadgeVariant(material.unit)}`}
                      >
                        <div className="flex items-center gap-1">
                          <span>{getUnitIcon(material.unit)}</span>
                          <span>{material.unit}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 sm:px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/materials/${material.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:bg-primary/10 flex-shrink-0"
                            title="Modifica Materiale"
                          >
                            <Edit size={14} />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(material.id)}
                          className="h-8 w-8 text-danger hover:bg-danger/10 flex-shrink-0"
                          title="Elimina Materiale"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
      <Toaster />
    </div>
  );
};