-- 1. Create the parent categories table
CREATE TABLE IF NOT EXISTS public.fleets_categories (
  id integer PRIMARY KEY,
  label text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert the default categories
INSERT INTO public.fleets_categories (id, label) VALUES 
  (1, 'Coverages'),
  (4, 'Services'),
  (43, 'Other Fees')
ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label;

-- 2. Create the unified charges table 
CREATE TABLE IF NOT EXISTS public.charges (
  id integer PRIMARY KEY,
  additional_charge_category_id integer REFERENCES public.fleets_categories(id),
  name text NOT NULL,
  charge_type text NOT NULL, -- 'amount', 'daily', 'percent'
  percent_amount jsonb,      -- e.g., {"1": {"amount": "65"}, "2": {"amount": "65"}}
  excluded_brands jsonb,     -- e.g., ["3"]
  source text NOT NULL DEFAULT 'hq', -- 'hq' or 'manual'
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Note: We use JSONB for percent_amount and excluded_brands for extreme flexibility without needing a complex sub-table.

-- 3. Set RLS (Row Level Security) - Optional but good practice.
-- Allow read access to anyone (for the frontend to consume)
ALTER TABLE public.fleets_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to fleets_categories" 
ON public.fleets_categories FOR SELECT USING (true);

CREATE POLICY "Allow public read access to charges" 
ON public.charges FOR SELECT USING (true);

-- Allow full access to authenticated admins (for your admin panel later)
-- Note: This assumes you have authenticated users. For now, since Supabase secret key bypasses RLS in backend, this is safe.
CREATE POLICY "Allow authenticated full access to fleets_categories" 
ON public.fleets_categories FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated full access to charges" 
ON public.charges FOR ALL USING (auth.role() = 'authenticated');
