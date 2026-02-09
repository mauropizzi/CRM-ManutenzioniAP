"use client"

import { Badge } from "@/components/ui/badge"

export function RecentSales() {
  const sales = [
    {
      name: "Mario Rossi",
      email: "mario@example.com",
      amount: "+€2,450.00",
      status: "Completato" as const,
    },
    {
      name: "Laura Bianchi",
      email: "laura@example.com",
      amount: "+€1,230.50",
      status: "In elaborazione" as const,
    },
    {
      name: "Paolo Verdi",
      email: "paolo@example.com",
      amount: "+€3,100.00",
      status: "Completato" as const,
    },
    {
      name: "Sofia Neri",
      email: "sofia@example.com",
      amount: "+€890.75",
      status: "In attesa" as const,
    },
  ]

  return (
    <div className="space-y-4">
      {sales.map((sale) => (
        <div key={sale.name} className="flex items-center">
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {sale.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {sale.email}
            </p>
          </div>
          <div className="ml-auto font-medium">
            {sale.amount}
          </div>
        </div>
      ))}
    </div>
  )
}