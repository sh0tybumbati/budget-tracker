-- Supabase SQL Schema for Budget Tracker with User Authentication & Row Level Security (RLS)

-- 1. Create the budget_data table linked to Supabase Auth users
CREATE TABLE IF NOT EXISTS public.budget_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    data JSONB NOT NULL DEFAULT '{"entries": [], "periodType": "semimonthly", "version": "1.0"}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.budget_data ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies ensuring each authenticated user can only access/modify their own budget data
DROP POLICY IF EXISTS "Users can read own budget data" ON public.budget_data;
CREATE POLICY "Users can read own budget data"
    ON public.budget_data FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own budget data" ON public.budget_data;
CREATE POLICY "Users can insert own budget data"
    ON public.budget_data FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own budget data" ON public.budget_data;
CREATE POLICY "Users can update own budget data"
    ON public.budget_data FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Create trigger to automatically update updated_at timestamp on edit
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_budget_data_updated_at ON public.budget_data;
CREATE TRIGGER set_budget_data_updated_at
    BEFORE UPDATE ON public.budget_data
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
