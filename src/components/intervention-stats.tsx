"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Wrench } from "lucide-react";

interface InterventionStatsProps {
  total: number;
  daFare: number;
  inCorso: number;
  completati: number;
}

export function InterventionStats({ total, daFare, inCorso, completati }: InterventionStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">Totale Interventi</p>
            <p className="text-2xl font-bold text-foreground">{total}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wrench className="h-5 w-5 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">Da fare</p>
            <p className="text-2xl font-bold text-foreground">{daFare}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center text-lg">🟡</div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">In corso</p>
            <p className="text-2xl font-bold text-foreground">{inCorso}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center text-lg">🔵</div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">Completati</p>
            <p className="text-2xl font-bold text-foreground">{completati}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-lg">🟢</div>
        </div>
      </Card>
    </div>
  );
}