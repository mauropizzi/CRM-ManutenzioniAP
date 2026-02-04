-- Create table
CREATE TABLE public.suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ragione_sociale TEXT NOT NULL,
  partita_iva TEXT,
  codice_fiscale TEXT,
  indirizzo TEXT,
  cap TEXT,
  citta TEXT,
  provincia TEXT,
  telefono TEXT,
  email TEXT,
  pec TEXT,
  tipo_servizio TEXT,
  attivo BOOLEAN DEFAULT true,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Policies: utenti autenticati gestiscono solo i propri record
CREATE POLICY "suppliers_select_own" ON public.suppliers
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "suppliers_insert_own" ON public.suppliers
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "suppliers_update_own" ON public.suppliers
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "suppliers_delete_own" ON public.suppliers
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Policies admin (coerenti con il resto del progetto, usa public.get_user_role)
CREATE POLICY "suppliers_admin_select" ON public.suppliers
FOR SELECT TO authenticated USING ((public.get_user_role(auth.uid()) = 'amministratore') OR (auth.uid() = user_id));

CREATE POLICY "suppliers_admin_update" ON public.suppliers
FOR UPDATE TO authenticated USING (public.get_user_role(auth.uid()) = 'amministratore');

CREATE POLICY "suppliers_admin_delete" ON public.suppliers
FOR DELETE TO authenticated USING (public.get_user_role(auth.uid()) = 'amministratore');

-- Trigger updated_at (riusa la funzione public.handle_updated_at già presente)
CREATE TRIGGER suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();