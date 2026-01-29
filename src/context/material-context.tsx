"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Material } from '@/types/material';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface MaterialContextType {
  materials: Material[];
  addMaterial: (material: Omit<Material, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateMaterial: (material: Material) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  loading: boolean;
}

const MaterialContext = createContext<MaterialContextType | undefined>(undefined);

export const MaterialProvider = ({ children }: { children: ReactNode }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchMaterials();
    }
  }, []);

  const fetchMaterials = async () => {
    try {
      console.log('Fetching materials from Supabase...');
      
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching materials:', error);
        toast.error(`Errore nel caricamento dei materiali: ${error.message}`);
        return;
      }

      console.log('Materials fetched:', data);
      
      if (data) {
        setMaterials(data as Material[]);
      }
    } catch (error: any) {
      console.error('Exception fetching materials:', error);
      toast.error(`Errore nel caricamento dei materiali: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const addMaterial = async (newMaterial: Omit<Material, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Devi essere autenticato per aggiungere un materiale");
        return;
      }

      const materialWithUserId = {
        ...newMaterial,
        user_id: user.id,
      };

      console.log('Adding material:', materialWithUserId);
      
      const { data, error } = await supabase
        .from('materials')
        .insert([materialWithUserId])
        .select()
        .single();

      if (error) {
        console.error('Supabase error adding material:', error);
        toast.error(`Errore nell'aggiunta del materiale: ${error.message}`);
        return;
      }

      console.log('Material added:', data);

      if (data) {
        setMaterials((prev) => [data as Material, ...prev]);
        toast.success("Materiale aggiunto con successo!");
      }
    } catch (error: any) {
      console.error('Exception adding material:', error);
      toast.error(`Errore nell'aggiunta del materiale: ${error?.message || 'Unknown error'}`);
    }
  };

  const updateMaterial = async (updatedMaterial: Material) => {
    try {
      console.log('Updating material:', updatedMaterial);
      
      const { data, error } = await supabase
        .from('materials')
        .update(updatedMaterial)
        .eq('id', updatedMaterial.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating material:', error);
        toast.error(`Errore nell'aggiornamento del materiale: ${error.message}`);
        return;
      }

      console.log('Material updated:', data);

      if (data) {
        setMaterials((prev) =>
          prev.map((material) =>
            material.id === updatedMaterial.id ? (data as Material) : material
          )
        );
        toast.success("Materiale aggiornato con successo!");
      }
    } catch (error: any) {
      console.error('Exception updating material:', error);
      toast.error(`Errore nell'aggiornamento del materiale: ${error?.message || 'Unknown error'}`);
    }
  };

  const deleteMaterial = async (id: string) => {
    try {
      console.log('Deleting material:', id);
      
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting material:', error);
        toast.error(`Errore nell'eliminazione del materiale: ${error.message}`);
        return;
      }

      setMaterials((prev) => prev.filter((material) => material.id !== id));
      toast.success("Materiale eliminato con successo!");
    } catch (error: any) {
      console.error('Exception deleting material:', error);
      toast.error(`Errore nell'eliminazione del materiale: ${error?.message || 'Unknown error'}`);
    }
  };

  return (
    <MaterialContext.Provider value={{ 
      materials, 
      addMaterial, 
      updateMaterial, 
      deleteMaterial,
      loading 
    }}>
      {children}
    </MaterialContext.Provider>
  );
};

export const useMaterials = () => {
  const context = useContext(MaterialContext);
  if (context === undefined) {
    throw new Error('useMaterials must be used within a MaterialProvider');
  }
  return context;
};