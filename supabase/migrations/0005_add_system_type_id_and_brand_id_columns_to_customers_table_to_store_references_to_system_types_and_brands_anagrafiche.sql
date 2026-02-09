ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS system_type_id UUID REFERENCES public.system_types(id),
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id),
ADD COLUMN IF NOT EXISTS system_type TEXT,
ADD COLUMN IF NOT EXISTS brand TEXT;