"use client";

import { Card } from '@/components/ui/card';
import { Wrench, Users, Clock, CheckCircle2 } from 'lucide-react';

interface StatsCardsProps {
  totalInterventions: number;
  pendingInterventions: number;
  inProgressInterventions: number;
  completedInterventions: number;
}

export function StatsCards({
  totalInterventions,
  pendingInterventions,
  inProgressInterventions,
  completedInterventions,
}: StatsCardsProps) {
  const stats = [
    {
      label: 'Totale Interventi',
      value: totalInterventions,
      icon: Wrench,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Da Fare',
      value: pendingInterventions,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'In Corso',
      value: inProgressInterventions,
      icon: Wrench,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      label: 'Completati',
      value: completedInterventions,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}