"use client";

import React from "react";
import { Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InterventionFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  assignedFilter: string;
  setAssignedFilter: (val: string) => void;
}

export function InterventionFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  assignedFilter,
  setAssignedFilter,
}: InterventionFiltersProps) {
  return (
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            <Select value={assignedFilter} onValueChange={setAssignedFilter}>
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
  );
}