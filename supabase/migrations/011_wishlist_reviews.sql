-- Customer retention and trust features.
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON public.wishlists(product_id);
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wishlists_select_own ON public.wishlists;
DROP POLICY IF EXISTS wishlists_insert_own ON public.wishlists;
DROP POLICY IF EXISTS wishlists_delete_own ON public.wishlists;
CREATE POLICY wishlists_select_own ON public.wishlists FOR SELECT USING (user_id = auth.uid());
CREATE POLICY wishlists_insert_own ON public.wishlists FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY wishlists_delete_own ON public.wishlists FOR DELETE USING (user_id = auth.uid());

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT true;
CREATE INDEX IF NOT EXISTS idx_reviews_approved_product ON public.reviews(product_id, is_approved, created_at DESC);
DROP POLICY IF EXISTS reviews_select_all ON public.reviews;
CREATE POLICY reviews_select_all ON public.reviews FOR SELECT
  USING (is_approved = true OR user_id = auth.uid() OR public.current_user_role() IN ('ADMIN', 'STAFF'));
DROP POLICY IF EXISTS reviews_admin ON public.reviews;
CREATE POLICY reviews_admin ON public.reviews FOR ALL
  USING (public.current_user_role() IN ('ADMIN', 'STAFF'))
  WITH CHECK (public.current_user_role() IN ('ADMIN', 'STAFF'));
