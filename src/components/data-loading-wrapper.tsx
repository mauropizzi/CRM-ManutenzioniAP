"use client";

import { useAuth } from "@/context/auth-context";
import { useMaterials } from "@/context/material-context";
import { useCustomers } from "@/context/customer-context";
import { useTechnicians } from "@/context/technician-context";
import { useSuppliers } from "@/context/supplier-context";
import { useInterventionRequests } from "@/context/intervention-context";
import { useSystemTypes } from "@/context/system-type-context";
import { useBrands } from "@/context/brand-context";
import { Loader2 } from "lucide-react";

export function DataLoadingWrapper({ children }: { children: React.ReactNode }) {
  const { loading: authLoading } = useAuth();
  const { loading: materialsLoading } = useMaterials();
  const { loading: customersLoading } = useCustomers();
  const { loading: techniciansLoading } = useTechnicians();
  const { loading: suppliersLoading } = useSuppliers();
  const { loading: interventionsLoading } = useInterventionRequests();
  const { loading: systemTypesLoading } = useSystemTypes();
  const { loading: brandsLoading } = useBrands();

  const isLoading = 
    authLoading ||
    materialsLoading ||
    customersLoading ||
    techniciansLoading ||
    suppliersLoading ||
    interventionsLoading ||
    systemTypesLoading ||
    brandsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento dati...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}