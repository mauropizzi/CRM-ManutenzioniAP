"use client";

import React from "react";

import ServicePointTable from "@/components/service-point-table";
import { Toaster } from "@/components/ui/sonner";
import { CustomerProvider } from "@/context/customer-context";
import { ServicePointProvider } from "@/context/service-point-context";

export default function ServicePointsPage() {
  return (
    <CustomerProvider>
      <ServicePointProvider>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8">
          <ServicePointTable />
          <Toaster />
        </div>
      </ServicePointProvider>
    </CustomerProvider>
  );
}