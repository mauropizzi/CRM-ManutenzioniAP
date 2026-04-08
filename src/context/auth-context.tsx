"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

const SUPABASE_PROJECT_REF = 'nrdsgtuzpnamcovuzghb';
const SUPABASE_STORAGE_KEY = `sb-${SUPABASE_PROJECT_REF}-auth-token`;

async function clearLocalAuthSession() {
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(SUPABASE_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      // Increased timeout from 5000ms to 10000ms to handle slow connections/cold starts
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), 10000)
      );

      try {
        const sessionPromise = supabase.auth.getSession();
        
        const result = await Promise.race([sessionPromise, timeoutPromise]) as { data: { session: any } };
        const session = result.data?.session;

        if (!isMounted) return;

        if (session?.user) {
          await fetchUserProfile(session.user);
        }
      } catch (error: any) {
        if (!isMounted) return;
        
        if (error?.message === 'Auth timeout') {
          console.warn('[auth-context] Auth initialization timed out, proceeding to guest state');
        } else if (error?.name === 'AbortError' || String(error?.message || '').includes('AbortError')) {
          return;
        } else {
          console.error('[auth-context] Auth initialization error:', error);
          
          const msg = String(error?.message || '');
          if (msg.includes('refresh_token_not_found') || msg.includes('Invalid Refresh Token')) {
            console.warn('[auth-context] Invalid refresh token detected, clearing local session...');
            await clearLocalAuthSession();
            setUser(null);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        await supabase.from('profiles').insert({
          id: authUser.id,
          first_name: authUser.user_metadata?.first_name || '',
          last_name: authUser.user_metadata?.last_name || '',
        });
        setUser({
          id: authUser.id,
          email: authUser.email,
          first_name: authUser.user_metadata?.first_name,
          last_name: authUser.user_metadata?.last_name,
        });
      } else if (data) {
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role,
        });
      } else {
        setUser({ id: authUser.id, email: authUser.email || '' });
      }
    } catch (error) {
      console.error('[auth-context] Profile fetch error:', error);
      setUser({ id: authUser.id, email: authUser.email || '' });
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(`Errore di accesso: ${error.message}`);
      throw error;
    }
    toast.success('Accesso effettuato con successo!');
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName } },
    });
    if (error) {
      toast.error(`Errore di registrazione: ${error.message}`);
      throw error;
    }
    toast.success('Registrazione completata! Controlla la tua email per confermare.');
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn('[auth-context] signOut error, clearing local session...', error);
      await clearLocalAuthSession();
    }
    setUser(null);
    toast.success('Logout effettuato!');
  };

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};