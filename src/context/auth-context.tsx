"use client";

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
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
  const initializedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const finishInitialization = () => {
      if (!isMounted || initializedRef.current) return;
      initializedRef.current = true;
      setLoading(false);
    };

    const buildUserProfile = async (authUser: any): Promise<User> => {
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

          return {
            id: authUser.id,
            email: authUser.email || '',
            first_name: authUser.user_metadata?.first_name,
            last_name: authUser.user_metadata?.last_name,
          };
        }

        if (data) {
          return {
            id: authUser.id,
            email: authUser.email || '',
            first_name: data.first_name,
            last_name: data.last_name,
            role: data.role,
          };
        }
      } catch (error) {
        console.error('[auth-context] Profile fetch error:', error);
      }

      return { id: authUser.id, email: authUser.email || '' };
    };

    const applySession = async (session: any) => {
      if (!isMounted) return;

      if (!session?.user) {
        setUser(null);
        finishInitialization();
        return;
      }

      const nextUser = await buildUserProfile(session.user);
      if (!isMounted) return;
      setUser(nextUser);
      finishInitialization();
    };

    const handleAuthError = async (error: any) => {
      const msg = String(error?.message || '');
      if (msg.includes('refresh_token_not_found') || msg.includes('Invalid Refresh Token')) {
        console.warn('[auth-context] Invalid refresh token detected, clearing local session...');
        await clearLocalAuthSession();
        if (isMounted) setUser(null);
        return;
      }
      console.error('[auth-context] Auth initialization error:', error);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });

    void supabase.auth
      .getSession()
      .then(async ({ data, error }) => {
        if (error) {
          await handleAuthError(error);
          return;
        }
        await applySession(data.session);
      })
      .catch(async (error) => {
        if (error?.name === 'AbortError' || String(error?.message || '').includes('AbortError')) {
          return;
        }
        await handleAuthError(error);
      })
      .finally(() => {
        finishInitialization();
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
