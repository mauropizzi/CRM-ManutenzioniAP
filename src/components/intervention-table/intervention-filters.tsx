"use client";

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface InterventionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export function InterventionFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: InterventionFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary h-4 w-4" />
        <Input
          placeholder="Cerca intervento..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="sm:w-44">
        <Select value={statusFilter} onValueChange={onStatusChange}>
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
    </div>
  );
}