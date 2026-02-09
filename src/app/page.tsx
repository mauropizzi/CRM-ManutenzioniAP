import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/overview"
import { RecentSales } from "@/components/recent-sales"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Package, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h1>
          <p className="text-secondary mt-1">Panoramica delle attività aziendali</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-lg">
            Esporta
          </Button>
          <Button size="sm" className="rounded-lg">
            Nuovo Report
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-base">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-secondary">Fatturato Totale</CardTitle>
            <DollarSign className="h-4 w-4 text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">€45,231.89</div>
            <p className="text-xs text-muted mt-1">
              <span className="flex items-center text-success">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +20.1% rispetto al mese scorso
              </span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-base">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-secondary">Nuovi Clienti</CardTitle>
            <Users className="h-4 w-4 text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">+235</div>
            <p className="text-xs text-muted mt-1">
              <span className="flex items-center text-success">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +180.1% rispetto al mese scorso
              </span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-base">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-secondary">Ordini Attivi</CardTitle>
            <Package className="h-4 w-4 text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">12,234</div>
            <p className="text-xs text-muted mt-1">
              <span className="flex items-center text-warning">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                -5.2% rispetto al mese scorso
              </span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-base">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-secondary">Tasso di Crescita</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">+12.5%</div>
            <p className="text-xs text-muted mt-1">
              <span className="flex items-center text-success">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +3.2% rispetto al mese scorso
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 card-base">
          <CardHeader>
            <CardTitle className="text-primary">Panoramica Vendite</CardTitle>
            <CardDescription className="text-secondary">
              Andamento delle vendite negli ultimi 6 mesi
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        
        <Card className="col-span-3 card-base">
          <CardHeader>
            <CardTitle className="text-primary">Vendite Recenti</CardTitle>
            <CardDescription className="text-secondary">
              Ultimi ordini effettuati
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-base">
        <CardHeader>
          <CardTitle className="text-primary">Azioni Rapide</CardTitle>
          <CardDescription className="text-secondary">
            Operazioni più comuni
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex-col gap-2 rounded-lg">
              <Package className="h-6 w-6" />
              <span>Nuovo Ordine</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2 rounded-lg">
              <Users className="h-6 w-6" />
              <span>Aggiungi Cliente</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2 rounded-lg">
              <DollarSign className="h-6 w-6" />
              <span>Fattura</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2 rounded-lg">
              <TrendingUp className="h-6 w-6" />
              <span>Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}