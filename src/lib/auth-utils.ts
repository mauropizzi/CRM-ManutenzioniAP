import { supabase } from '@/integrations/supabase/client';

export async function resolveAuthenticatedUserId(preferredUserId?: string) {
  if (preferredUserId) return preferredUserId;

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (sessionData.session?.user?.id) return sessionData.session.user.id;

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (userData.user?.id) return userData.user.id;

  throw new Error('Devi essere autenticato');
}
