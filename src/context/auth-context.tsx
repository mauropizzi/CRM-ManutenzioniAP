"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const profileFetchInProgress = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user) {
          await fetchUserProfile(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: any) => {
    // Prevent multiple simultaneous fetches
    if (profileFetchInProgress.current) {
      console.log('Profile fetch already in progress, skipping...');
      return;
    }
    
    profileFetchInProgress.current = true;
    console.log('Fetching profile for user:', authUser.id);
    
    try {
      // Try to fetch profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      console.log('Profile fetch result:', { data, error });

      if (error) {
        console.log('Profile fetch error code:', error.code);
        
        // If profile doesn't exist (PGRST116 = not found), create it
        if (error.code === 'PGRST116' || error.message?.includes('not found') || error.message?.includes('No rows found')) {
          console.log('Profile not found, creating new profile...');
          
          const newProfileData = {
            id: authUser.id,
            first_name: authUser.user_metadata?.first_name || '',
            last_name: authUser.user_metadata?.last_name || '',
          };
          
          console.log('Inserting profile data:', newProfileData);
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([newProfileData])
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            
            // If user doesn't exist in auth.users table (database reset), force logout
            if (createError.code === '23503') {
              console.error('User does not exist in database, forcing logout...');
              toast.error("Sessione non valida. Effettua nuovamente il login.");
              await signOut();
              return;
            }
            
            // Still set user without profile data for other errors
            setUser({
              id: authUser.id,
              email: authUser.email || '',
            });
            return;
          }

          console.log('New profile created:', newProfile);

          if (newProfile) {
            setUser({
              id: authUser.id,
              email: authUser.email || '',
              first_name: newProfile.first_name,
              last_name: newProfile.last_name,
              role: newProfile.role,
            });
            return;
          }
        } else {
          console.error('Error fetching profile (not 404):', error);
        }
      }

      if (data) {
        console.log('Profile found:', data);
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role,
        });
      } else {
        // Fallback if no profile data
        console.log('No profile data, using fallback');
        setUser({
          id: authUser.id,
          email: authUser.email || '',
        });
      }
    } catch (error) {
      console.error('Exception in fetchUserProfile:', error);
      setUser({
        id: authUser.id,
        email: authUser.email || '',
      });
    } finally {
      profileFetchInProgress.current = false;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(`Errore di accesso: ${error.message}`);
      throw error;
    }

    toast.success("Accesso effettuato con successo!");
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      toast.error(`Errore di registrazione: ${error.message}`);
      throw error;
    }

    toast.success("Registrazione completata! Controlla la tua email per confermare.");
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Errore di logout: ${error.message}`);
      throw error;
    }
    setUser(null);
    toast.success("Logout effettuato!");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};