"use client";

import React from "react";
import SupplierForm, { SupplierFormValues } from "@/components/supplier-form";
import { useSuppliers } from "@/context/supplier-context";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

const NewSupplierContent: React.FC = () => {
  const { addSupplier } = useSuppliers();
  const router = useRouter();

  const handleSubmit = async (data: SupplierFormValues) => {
    try {
      await addSupplier(data);
      router.push("/suppliers");
    } catch (error: any) {
      const msg = error?.message || "Errore durante il salvataggio del fornitore.";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nuovo Fornitore</h1>
        <Link href="/suppliers">
          <Button variant="outline">Indietro</Button>
        </Link>
      </div>
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
        <SupplierForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default function NewSupplierPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <SupplierProvider>
          <NewSupplierContent />
        </SupplierProvider>
      </div>
      <Toaster />
    </div>
  );
}