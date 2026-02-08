-- Create service_points table
CREATE TABLE public.service_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  cap TEXT,
  province TEXT,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.service_points ENABLE ROW LEVEL SECURITY;

-- Create policies for service_points
CREATE POLICY "Users can view own service points" ON public.service_points
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own service points" ON public.service_points
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own service points" ON public.service_points
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own service points" ON public.service_points
FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all service points" ON public.service_points
FOR SELECT TO authenticated USING (get_user_role(auth.uid()) = 'amministratore'::text OR auth.uid() = user_id);

CREATE POLICY "Admins can update all service points" ON public.service_points
FOR UPDATE TO authenticated USING (get_user_role(auth.uid()) = 'amministratore'::text);

CREATE POLICY "Admins can delete all service points" ON public.service_points
FOR DELETE TO authenticated USING (get_user_role(auth.uid()) = 'amministratore'::text);

-- Create service_point_systems table for multiple systems per service point
CREATE TABLE public.service_point_systems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_point_id UUID REFERENCES public.service_points(id) ON DELETE CASCADE,
  system_type TEXT NOT NULL,
  brand TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for service_point_systems
ALTER TABLE public.service_point_systems ENABLE ROW LEVEL SECURITY;

-- Create policies for service_point_systems
CREATE POLICY "Users can view own service point systems" ON public.service_point_systems
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.service_points 
    WHERE id = service_point_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own service point systems" ON public.service_point_systems
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.service_points 
    WHERE id = service_point_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own service point systems" ON public.service_point_systems
FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.service_points 
    WHERE id = service_point_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own service point systems" ON public.service_point_systems
FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.service_points 
    WHERE id = service_point_id AND user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER service_points_updated_at
BEFORE UPDATE ON public.service_points
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();