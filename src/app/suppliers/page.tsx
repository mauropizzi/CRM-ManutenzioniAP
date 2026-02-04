"use client";

import React from "react";
import { SupplierProvider, useSuppliers } from "@/context/supplier-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SupplierTable } from "@/components/supplier-table";
import { Toaster } from "@/components/ui/sonner";

const SuppliersContent: React.FC = () => {
  const { suppliers, loading } = useSuppliers();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Fornitori</h1>
        <div className="flex gap-2">
          <Link href="/suppliers/setup">
            <Button variant="outline">Setup</Button>
          </Link>
          <Link href="/suppliers/new">
            <Button className="bg-blue-600 hover:bg-blue-700">Nuovo fornitore</Button>
          </Link>
        </div>
      </div>
      {loading ? (
        <div className="rounded-lg border bg-white p-6 dark:bg-gray-900">Caricamento...</div>
      ) : suppliers.length === 0 ? (
        <div className="rounded-lg border bg-white p-6 dark:bg-gray-900">
          <p className="text-gray-700 dark:text-gray-300">
            Nessun fornitore. Se è la prima volta, crea la tabella in Supabase:
          </p>
          <Link href="/suppliers/setup" className="mt-2 inline-block">
            <Button variant="outline">Apri Setup</Button>
          </Link>
        </div>
      ) : (
        <SupplierTable suppliers={suppliers} />
      )}
    </div>
  );
};

export default function SuppliersPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <SupplierProvider>
          <SuppliersContent />
        </SupplierProvider>
      </div>
      <Toaster />
    </div>
  );
}