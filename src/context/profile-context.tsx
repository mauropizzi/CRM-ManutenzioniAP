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

      // Prova a ottenere il profilo
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // Se il profilo non esiste, crealo
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              first_name: user.user_metadata?.first_name || null,
              last_name: user.user_metadata?.last_name || null,
              role: 'tecnico',
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            setProfile(null);
          } else {
            setProfile(newProfile as Profile);
          }
        } else {
          console.error('Error fetching profile:', error);
          setProfile(null);
        }
      } else {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        fetchProfile();
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateProfile = async (data: Partial<Profile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non autenticato');

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