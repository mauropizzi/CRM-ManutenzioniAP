-- Create service_points table
CREATE TABLE IF NOT EXISTS public.service_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  cap TEXT,
  provincia TEXT,
  telefono TEXT,
  email TEXT,
  note TEXT,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by TEXT NOT NULL
);

-- Create service_point_systems table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.service_point_systems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_point_id UUID NOT NULL REFERENCES public.service_points(id) ON DELETE CASCADE,
  system_type TEXT NOT NULL,
  brand TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_points_customer_id ON public.service_points(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_point_systems_service_point_id ON public.service_point_systems(service_point_id);

-- Enable Row Level Security
ALTER TABLE public.service_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_point_systems ENABLE ROW LEVEL SECURITY;

-- Policies for service_points
CREATE POLICY "Users can view their own service points" ON public.service_points
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own service points" ON public.service_points
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own service points" ON public.service_points
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own service points" ON public.service_points
  FOR DELETE USING (created_by = auth.uid());

-- Policies for service_point_systems
CREATE POLICY "Users can view systems of their own service points" ON public.service_point_systems
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.service_points 
      WHERE service_points.id = service_point_systems.service_point_id 
      AND service_points.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert systems for their own service points" ON public.service_point_systems
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.service_points 
      WHERE service_points.id = service_point_systems.service_point_id 
      AND service_points.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update systems of their own service points" ON public.service_point_systems
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.service_points 
      WHERE service_points.id = service_point_systems.service_point_id 
      AND service_points.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete systems of their own service points" ON public.service_point_systems
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.service_points 
      WHERE service_points.id = service_point_systems.service_point_id 
      AND service_points.created_by = auth.uid()
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for service_points
CREATE TRIGGER handle_service_points_updated_at
  BEFORE UPDATE ON public.service_points
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();