ALTER TABLE public.service_point_systems
ADD COLUMN IF NOT EXISTS system_type_id UUID,
ADD COLUMN IF NOT EXISTS brand_id UUID;

-- Backfill system_type_id from system_type (name) for the current authenticated user
UPDATE public.service_point_systems
SET system_type_id = st.id
FROM public.system_types st
WHERE service_point_systems.system_type_id IS NULL
  AND service_point_systems.system_type IS NOT NULL
  AND st.name = service_point_systems.system_type
  AND st.user_id = (
    SELECT auth.uid()
  );

-- Backfill brand_id from brand (name) for the current authenticated user
UPDATE public.service_point_systems
SET brand_id = b.id
FROM public.brands b
WHERE service_point_systems.brand_id IS NULL
  AND service_point_systems.brand IS NOT NULL
  AND b.name = service_point_systems.brand
  AND b.user_id = (
    SELECT auth.uid()
  );

-- Optional (after migration): make system_type_id and brand_id NOT NULL
-- ALTER TABLE public.service_point_systems
-- ALTER COLUMN system_type_id SET NOT NULL,
-- ALTER COLUMN brand_id SET NOT NULL;

-- Optional: drop the old text columns after confirming everything works
-- ALTER TABLE public.service_point_systems
-- DROP COLUMN IF EXISTS system_type,
-- DROP COLUMN IF EXISTS brand;