"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Material } from '@/types/material';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth-context';

interface MaterialContextType {
  materials: Material[];
  addMaterial: (material: Omit<Material, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateMaterial: (material: Material) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  refreshMaterials: () => Promise<void>;
  loading: boolean;
}

const MaterialContext = createContext<MaterialContextType | undefined>(undefined);

export const MaterialProvider = ({ children }: { children: ReactNode }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isMounted = useRef(true);

  const refreshMaterials = async () => {
    if (!isMounted.current) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('materials').select('*').order('created_at', { ascending: false });
      if (!isMounted.current) return;
      if (error) {
        if (error.name === 'AbortError' || error.message?.includes('aborted')) return;
        toast.error(`Errore nel caricamento dei materiali: ${error.message}`);
        return;
      }
      setMaterials((data as Material[]) || []);
    } catch (error: any) {
      if (!isMounted.current) return;
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) return;
      toast.error(`Errore nel caricamento dei materiali: ${error?.message || 'Unknown error'}`);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    if (user) {
      refreshMaterials();
    } else {
      setMaterials([]);
      setLoading(false);
    }
    return () => { isMounted.current = false; };
  }, [user]);

  const addMaterial = async (newMaterial: Omit<Material, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Devi essere autenticato per aggiungere un materiale"); return; }
      const { data, error } = await supabase.from('materials').insert([{ ...newMaterial, user_id: user.id }]).select();
      if (error) { toast.error(`Errore nell'aggiunta del materiale: ${error.message}`); return; }
      if (data && data.length > 0) { setMaterials((prev) => [data[0] as Material, ...prev]); toast.success("Materiale aggiunto con successo!"); }
    } catch (error: any) {
      toast.error(`Errore nell'aggiunta del materiale: ${error?.message || 'Unknown error'}`);
    }
  };

  const updateMaterial = async (updatedMaterial: Material) => {
    try {
      const { data, error } = await supabase.from('materials').update(updatedMaterial).eq('id', updatedMaterial.id).select().single();
      if (error) { toast.error(`Errore nell'aggiornamento del materiale: ${error.message}`); return; }
      if (data) {
        setMaterials((prev) => prev.map((m) => m.id === updatedMaterial.id ? (data as Material) : m));
        toast.success("Materiale aggiornato con successo!");
      }
    } catch (error: any) {
      toast.error(`Errore nell'aggiornamento del materiale: ${error?.message || 'Unknown error'}`);
    }
  };

  const deleteMaterial = async (id: string) => {
    try {
      const { error } = await supabase.from('materials').delete().eq('id', id);
      if (error) { toast.error(`Errore nell'eliminazione del materiale: ${error.message}`); return; }
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      toast.success("Materiale eliminato con successo!");
    } catch (error: any) {
      toast.error(`Errore nell'eliminazione del materiale: ${error?.message || 'Unknown error'}`);
    }
  };

  return (
    <MaterialContext.Provider value={{ materials, addMaterial, updateMaterial, deleteMaterial, refreshMaterials, loading }}>
      {children}
    </MaterialContext.Provider>
  );
};

export const useMaterials = () => {
  const context = useContext(MaterialContext);
  if (context === undefined) throw new Error('useMaterials must be used within a MaterialProvider');
  return context;
};