-- Create a customer profile automatically whenever a Supabase Auth user is created.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(COALESCE(NEW.email, ''), '@', 1)),
    NEW.email,
    'CUSTOMER'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for Auth users created before the trigger existed.
INSERT INTO public.profiles (id, full_name, email, role)
SELECT
  users.id,
  COALESCE(users.raw_user_meta_data ->> 'full_name', split_part(COALESCE(users.email, ''), '@', 1)),
  users.email,
  'CUSTOMER'
FROM auth.users AS users
ON CONFLICT (id) DO NOTHING;
