import Link from "next/link";
import {
  Package,
  ClipboardList,
  Users,
  UserCog,
  Truck,
  MapPin,
  Tag,
  Layers,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";

import { ProtectedRoute } from "@/components/protected-route";
import { Card } from "@/components/ui/card";

type DashboardLink = {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  accentClassName: string;
};

const LINKS: DashboardLink[] = [
  {
    title: "Interventi",
    description: "Gestisci richieste, assegnazioni e bolla di lavoro",
    href: "/interventions",
    icon: ClipboardList,
    accentClassName: "bg-info/10 text-info",
  },
  {
    title: "Clienti",
    description: "Anagrafica clienti e dettagli contatto",
    href: "/customers",
    icon: Users,
    accentClassName: "bg-success/10 text-success",
  },
  {
    title: "Materiali",
    description: "Catalogo ricambi e materiali utilizzati",
    href: "/materials",
    icon: Package,
    accentClassName: "bg-primary/10 text-primary",
  },
  {
    title: "Tecnici",
    description: "Anagrafica tecnici e reperibilità",
    href: "/technicians",
    icon: UserCog,
    accentClassName: "bg-warning/10 text-warning",
  },
  {
    title: "Fornitori",
    description: "Gestisci fornitori e contatti",
    href: "/suppliers",
    icon: Truck,
    accentClassName: "bg-primary/10 text-primary",
  },
  {
    title: "Punti servizio",
    description: "Sedi/impianti collegati ai clienti",
    href: "/service-points",
    icon: MapPin,
    accentClassName: "bg-info/10 text-info",
  },
  {
    title: "Marche",
    description: "Lista marche disponibili per impianti",
    href: "/brands",
    icon: Tag,
    accentClassName: "bg-success/10 text-success",
  },
  {
    title: "Tipi impianto",
    description: "Tipologie e classificazioni impianti",
    href: "/system-types",
    icon: Layers,
    accentClassName: "bg-warning/10 text-warning",
  },
];

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 p-4 dark:bg-gray-950 sm:p-8">
        <div className="space-y-6">
          {/* Header (stesso linguaggio visivo della pagina Materiali) */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
              </div>
              <p className="mt-2 text-sm text-text-secondary">
                Accesso rapido alle sezioni principali
              </p>
            </div>
          </div>

          {/* Link cards (stesso stile delle card in Materiali) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LINKS.map((item) => (
              <Link key={item.href} href={item.href} className="group">
                <Card className="h-full rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                        {item.description}
                      </p>
                    </div>

                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.accentClassName}`}
                      aria-hidden="true"
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">Apri</span>
                    <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}