"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Profile, UserRole } from '@/types/profile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileContextType {
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isOffice: boolean;
  isTechnician: boolean;
  canManageUsers: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setProfile(data as Profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error("Errore nel caricamento del profilo");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateProfile = async (data: Partial<Profile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;
      
      await fetchProfile();
      toast.success("Profilo aggiornato con successo");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Errore nell'aggiornamento del profilo");
    }
  };

  const isAdmin = profile?.role === 'amministratore';
  const isOffice = profile?.role === 'ufficio';
  const isTechnician = profile?.role === 'tecnico';
  const canManageUsers = isAdmin || isOffice;

  return (
    <ProfileContext.Provider value={{
      profile,
      isLoading,
      isAdmin,
      isOffice,
      isTechnician,
      canManageUsers,
      refreshProfile: fetchProfile,
      updateProfile,
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};