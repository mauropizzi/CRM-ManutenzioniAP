"use client";

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Material } from '@/types/material';
import { useMaterials } from '@/context/material-context';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import Link from 'next/link';

export const MaterialTable = () => {
  const { materials, deleteMaterial } = useMaterials();

  const handleDeleteClick = (id: string) => {
    deleteMaterial(id);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Anagrafica Materiali</h2>
        <Link href="/materials/new" passHref>
          <Button className="rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 flex items-center gap-2">
            <PlusCircle size={18} /> Aggiungi Materiale
          </Button>
        </Link>
      </div>

      {materials.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nessun materiale trovato. Aggiungi un nuovo materiale per iniziare!</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
          <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 rounded-tl-md">U.M.</TableHead>
                {/* <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Quantità</TableHead> */}
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Descrizione</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 rounded-tr-md">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {materials.map((material: Material) => (
                <TableRow key={material.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{material.unit}</TableCell>
                  {/* <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{material.quantity}</TableCell> */}
                  <TableCell className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">{material.description}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                    <Link href={`/materials/${material.id}/edit`} passHref>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-md text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700"
                      >
                        <Edit size={18} />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(material.id)}
                      className="rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Toaster />
    </div>
  );
};