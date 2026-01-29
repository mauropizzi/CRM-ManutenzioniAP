"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/context/profile-context';

export default function LoginPage() {
  const router = useRouter();
  const { profile, isLoading } = useProfile();

  useEffect(() => {
    if (!isLoading && profile) {
      // Se l'utente è già loggato, redirect alla dashboard
      router.push('/dashboard');
    }
  }, [profile, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (profile) {
    return null; // Redirect in corso
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Gestione Interventi
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Accedi o registrati per continuare
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
          <Auth
            supabaseClient={supabase}
            providers={[]}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb',
                    brandAccent: '#1d4ed8',
                  },
                },
              },
            }}
            theme="light"
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Password',
                  email_input_placeholder: 'nome@azienda.it',
                  password_input_placeholder: 'La tua password',
                  button_label: 'Accedi',
                  loading_button_label: 'Accesso in corso...',
                  social_provider_text: '{{provider}}',
                  link_text: 'Hai già un account? Accedi',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Password',
                  email_input_placeholder: 'nome@azienda.it',
                  password_input_placeholder: 'Scegli una password',
                  button_label: 'Registrati',
                  loading_button_label: 'Registrazione in corso...',
                  social_provider_text: '{{provider}}',
                  link_text: 'Non hai un account? Registrati',
                  confirmation_text: 'Controlla la tua email per il link di conferma',
                },
                forgotten_password: {
                  email_label: 'Email',
                  password_label: 'Password',
                  email_input_placeholder: 'nome@azienda.it',
                  button_label: 'Invia istruzioni reset',
                  loading_button_label: 'Invio in corso...',
                  link_text: 'Password dimenticata?',
                  confirmation_text: 'Controlla la tua email per il link di reset',
                },
                update_password: {
                  password_label: 'Nuova password',
                  password_input_placeholder: 'Nuova password',
                  button_label: 'Aggiorna password',
                  loading_button_label: 'Aggiornamento in corso...',
                  confirmation_text: 'Password aggiornata',
                },
              },
            }}
          />
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Sistema di gestione interventi tecnici</p>
        </div>
      </div>
    </div>
  );
}