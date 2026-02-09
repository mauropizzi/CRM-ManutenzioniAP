-- Add system type and brand columns to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS system_type_id UUID REFERENCES public.system_types(id);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS system_type TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS brand TEXT;