"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench } from 'lucide-react';

interface EmptyStateProps {
  hasData: boolean;
  onCreateNew: () => void;
}

export function EmptyState({ hasData, onCreateNew }: EmptyStateProps) {
  return (
    <CardContent className="py-12">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Wrench className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          {hasData ? 'Nessun intervento trovato' : 'Nessun intervento presente'}
        </h3>
        <p className="text-text-secondary mb-6">
          {hasData
            ? 'Prova a modificare i filtri di ricerca o aggiungi un nuovo intervento'
            : 'Aggiungi il primo intervento per iniziare'}
        </p>
        <Button variant="default" onClick={onCreateNew}>
          {hasData ? 'Nuovo Intervento' : 'Primo Intervento'}
        </Button>
      </div>
    </CardContent>
  );
}