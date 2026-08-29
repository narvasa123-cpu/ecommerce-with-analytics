-- Fix the remaining RLS recursion in the already-deployed database.
-- The old policies queried profiles from inside another profiles policy.
-- A SECURITY DEFINER helper reads the role without re-entering profiles RLS.
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

DROP POLICY IF EXISTS profiles_admin ON profiles;
CREATE POLICY profiles_admin ON profiles FOR ALL
  USING (public.current_user_role() = 'ADMIN')
  WITH CHECK (public.current_user_role() = 'ADMIN');

DROP POLICY IF EXISTS products_select_staff ON products;
CREATE POLICY products_select_staff ON products FOR SELECT
  USING (public.current_user_role() IN ('ADMIN', 'STAFF'));
