"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Se l'utente è già loggato, reindirizza alla dashboard
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/interventions");
      }
    };

    checkSession();

    // Ascolta i cambiamenti di autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.push("/interventions");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Gestione Interventi</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Accedi o registrati per continuare
          </p>
        </CardHeader>
        <CardContent>
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
                  email_label: "Email",
                  password_label: "Password",
                  button_label: "Accedi",
                  loading_button_label: "Accesso in corso...",
                  social_provider_text: "Accedi con {{provider}}",
                  link_text: "Hai già un account? Accedi",
                },
                sign_up: {
                  email_label: "Email",
                  password_label: "Password",
                  button_label: "Registrati",
                  loading_button_label: "Registrazione in corso...",
                  social_provider_text: "Registrati con {{provider}}",
                  link_text: "Non hai un account? Registrati",
                  confirmation_text: "Controlla la tua email per il link di conferma",
                },
                forgotten_password: {
                  email_label: "Email",
                  button_label: "Invia istruzioni reset",
                  loading_button_label: "Invio in corso...",
                  link_text: "Password dimenticata?",
                  confirmation_text: "Controlla la tua email per il link di reset",
                },
                update_password: {
                  password_label: "Nuova password",
                  button_label: "Aggiorna password",
                  loading_button_label: "Aggiornamento in corso...",
                  confirmation_text: "Password aggiornata con successo",
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}