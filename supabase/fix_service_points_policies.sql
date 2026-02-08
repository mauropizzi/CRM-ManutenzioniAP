-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own service points" ON public.service_points;
DROP POLICY IF EXISTS "Users can insert their own service points" ON public.service_points;
DROP POLICY IF EXISTS "Users can update their own service points" ON public.service_points;
DROP POLICY IF EXISTS "Users can delete their own service points" ON public.service_points;

DROP POLICY IF EXISTS "Users can view systems of their own service points" ON public.service_point_systems;
DROP POLICY IF EXISTS "Users can insert systems for their own service points" ON public.service_point_systems;
DROP POLICY IF EXISTS "Users can update systems of their own service points" ON public.service_point_systems;
DROP POLICY IF EXISTS "Users can delete systems of their own service points" ON public.service_point_systems;

-- Fix: Convert created_by to UUID (preferred solution)
ALTER TABLE public.service_points 
  ALTER COLUMN created_by TYPE uuid USING (created_by::uuid);

-- Add foreign key to auth.users for better data integrity
ALTER TABLE public.service_points 
  ADD CONSTRAINT fk_service_points_created_by 
  FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- Recreate policies with proper UUID comparison
CREATE POLICY "Users can view their own service points" ON public.service_points
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = created_by);

CREATE POLICY "Users can insert their own service points" ON public.service_points
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = created_by);

CREATE POLICY "Users can update their own service points" ON public.service_points
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = created_by);

CREATE POLICY "Users can delete their own service points" ON public.service_points
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = created_by);

-- Policies for service_point_systems (now using UUID comparison)
CREATE POLICY "Users can view systems of their own service points" ON public.service_point_systems
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.service_points 
      WHERE service_points.id = service_point_systems.service_point_id 
        AND service_points.created_by = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can insert systems for their own service points" ON public.service_point_systems
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.service_points 
      WHERE service_points.id = service_point_systems.service_point_id 
        AND service_points.created_by = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update systems of their own service points" ON public.service_point_systems
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.service_points 
      WHERE service_points.id = service_point_systems.service_point_id 
        AND service_points.created_by = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can delete systems of their own service points" ON public.service_point_systems
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.service_points 
      WHERE service_points.id = service_point_systems.service_point_id 
        AND service_points.created_by = (SELECT auth.uid())
    )
  );