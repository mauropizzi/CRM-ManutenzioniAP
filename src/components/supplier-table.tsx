"use client";

import React from "react";
import { Supplier } from "@/types/supplier";
import { useSuppliers } from "@/context/supplier-context";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Trash2, Pencil } from "lucide-react";

interface SupplierTableProps {
  suppliers: Supplier[];
}

export const SupplierTable: React.FC<SupplierTableProps> = ({ suppliers }) => {
  const { deleteSupplier } = useSuppliers();

  return (
    <div className="rounded-lg border bg-white dark:bg-gray-900">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ragione sociale</TableHead>
            <TableHead>Partita IVA</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>PEC</TableHead>
            <TableHead>Telefono</TableHead>
            <TableHead>Tipo servizio</TableHead>
            <TableHead>Attivo</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-medium">{s.ragione_sociale}</TableCell>
              <TableCell>{s.partita_iva || "-"}</TableCell>
              <TableCell>{s.email || "-"}</TableCell>
              <TableCell>{s.pec || "-"}</TableCell>
              <TableCell>{s.telefono || "-"}</TableCell>
              <TableCell>{s.tipo_servizio || "-"}</TableCell>
              <TableCell>{s.attivo ? "Sì" : "No"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/suppliers/${s.id}/edit`}>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Pencil size={16} />
                      Modifica
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    className="flex items-center gap-2"
                    onClick={() => deleteSupplier(s.id)}
                  >
                    <Trash2 size={16} />
                    Elimina
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {suppliers.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-gray-500">
                Nessun fornitore presente
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SupplierTable;