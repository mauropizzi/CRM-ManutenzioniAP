"use client";

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Edit, MapPin, Calendar, User, Wrench } from 'lucide-react';
import { Intervention } from '@/types/intervention';

interface InterventionRowProps {
  intervention: Intervention;
  statusBadgeClass: (status: string) => string;
  onTechnicianClick?: (technician: string) => void;
}

export function InterventionRow({ intervention, statusBadgeClass, onTechnicianClick }: InterventionRowProps) {
  return (
    <TableRow className="hover:bg-muted/30 transition-colors">
      <TableCell className="px-4 sm:px-6 py-4">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground truncate">
              {intervention.client_company_name}
            </div>
            <div className="text-xs text-text-secondary truncate">
              {intervention.system_type} • {intervention.brand} {intervention.model}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell className="px-4 sm:px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm text-foreground">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate">{intervention.client_address || '—'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{intervention.scheduled_date || '—'}</span>
          </div>
        </div>
      </TableCell>

      <TableCell className="px-4 sm:px-6 py-4">
        <div className="space-y-1">
          {intervention.assigned_technicians ? (
            <div className="flex items-center gap-1.5 text-sm text-foreground">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <button
                onClick={() => onTechnicianClick?.(intervention.assigned_technicians)}
                className="text-left truncate hover:text-primary transition-colors"
                title={intervention.assigned_technicians}
              >
                {intervention.assigned_technicians}
              </button>
            </div>
          ) : (
            <div className="text-sm text-text-secondary">—</div>
          )}
          {intervention.office_notes && (
            <div className="text-xs text-text-secondary truncate" title={intervention.office_notes}>
              {intervention.office_notes}
            </div>
          )}
        </div>
      </TableCell>

      <TableCell className="px-4 sm:px-6 py-4">
        <Badge
          className={`rounded-full px-2.5 py-1 text-xs font-medium border ${statusBadgeClass(intervention.status)}`}
        >
          {intervention.status}
        </Badge>
      </TableCell>

      <TableCell className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-end gap-1">
          <Link href={`/interventions/${intervention.id}/conclude`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-info hover:bg-info/10"
              title="Concludi intervento"
            >
              <Wrench size={14} />
            </Button>
          </Link>
          <Link href={`/interventions/${intervention.id}/edit`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:bg-primary/10"
              title="Modifica intervento"
            >
              <Edit size={14} />
            </Button>
          </Link>
        </div>
      </TableCell>
    </TableRow>
  );
}