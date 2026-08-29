-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES RLS POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY profiles_select_self ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can read other profiles (for display purposes, limited fields)
CREATE POLICY profiles_select_public ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY profiles_update_self ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND (
      -- Users cannot change their own role
      role = (SELECT role FROM profiles WHERE id = auth.uid())
      OR role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid())
    )
  );

-- Admins can manage all profiles
CREATE POLICY profiles_admin ON profiles FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');

-- Only admins can insert profiles
CREATE POLICY profiles_insert_admin ON profiles FOR INSERT
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');

-- ============================================
-- CATEGORIES RLS POLICIES
-- ============================================

-- Everyone can read active categories
CREATE POLICY categories_select_active ON categories FOR SELECT
  USING (is_active = true);

-- Admins and staff can read all categories
CREATE POLICY categories_select_staff ON categories FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'STAFF'));

-- Admins can manage categories
CREATE POLICY categories_admin ON categories FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');

-- Staff can insert and update categories
CREATE POLICY categories_staff_write ON categories FOR INSERT
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'STAFF'));

CREATE POLICY categories_staff_update ON categories FOR UPDATE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'STAFF'))
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'STAFF'));

-- ============================================
-- PRODUCTS RLS POLICIES
-- ============================================

-- Everyone can read active products
CREATE POLICY products_select_active ON products FOR SELECT
  USING (is_active = true);

-- Staff and admin can read all products
CREATE POLICY products_select_staff ON products FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'STAFF'));

-- Admins and staff can manage products
CREATE POLICY products_admin ON products FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'STAFF'))
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'STAFF'));

-- ============================================
-- ADDRESSES RLS POLICIES
-- ============================================

-- Users can read their own addresses
CREATE POLICY addresses_select_own ON addresses FOR SELECT
  USING (auth.uid() = user_id);

-- Users can manage their own addresses
CREATE POLICY addresses_manage_own ON addresses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all addresses
CREATE POLICY addresses_admin ON addresses FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');

-- ============================================
-- CARTS RLS POLICIES
-- ============================================

-- Users can read their own cart
CREATE POLICY carts_select_own ON carts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can manage their own cart
CREATE POLICY carts_manage_own ON carts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all carts
CREATE POLICY carts_admin ON carts FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');

-- ============================================
-- CART_ITEMS RLS POLICIES
-- ============================================

-- Users can manage cart items in their cart
CREATE POLICY cart_items_manage_own ON cart_items FOR ALL
  USING (
    auth.uid() = (SELECT user_id FROM carts WHERE id = cart_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM carts WHERE id = cart_id)
  );

-- Admins can read all cart items
CREATE POLICY cart_items_admin ON cart_items FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');

-- ============================================
-- ORDERS RLS POLICIES
-- ============================================

-- Users can read their own orders
CREATE POLICY orders_select_own ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own orders
CREATE POLICY orders_insert_own ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Staff can read all orders
CREATE POLICY orders_select_staff ON orders FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'STAFF'));

-- Staff can update orders (but not delete)
CREATE POLICY orders_update_staff ON orders FOR UPDATE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'STAFF'))
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'STAFF'));

-- Admins can manage all orders
CREATE POLICY orders_admin ON orders FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');

-- ============================================
-- ORDER_ITEMS RLS POLICIES
-- ============================================

-- Users can read order items from their orders
CREATE POLICY order_items_select_own ON order_items FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM orders WHERE id = order_id)
  );

-- Staff can read all order items
CREATE POLICY order_items_select_staff ON order_items FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'STAFF'));

-- Admins can manage all order items
CREATE POLICY order_items_admin ON order_items FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');

-- ============================================
-- ORDER_STATUS_HISTORY RLS POLICIES
-- ============================================

-- Users can read status history for their orders
CREATE POLICY order_status_history_select_own ON order_status_history FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM orders WHERE id = order_id)
  );

-- Staff can read all status history
CREATE POLICY order_status_history_select_staff ON order_status_history FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'STAFF'));

-- Staff can insert status updates
CREATE POLICY order_status_history_insert_staff ON order_status_history FOR INSERT
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'STAFF'));

-- Admins can manage all
CREATE POLICY order_status_history_admin ON order_status_history FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');

-- ============================================
-- DELIVERIES RLS POLICIES
-- ============================================

-- Riders can see their own deliveries
CREATE POLICY deliveries_select_own ON deliveries FOR SELECT
  USING (auth.uid() = rider_id);

-- Customers can see delivery status for their orders
CREATE POLICY deliveries_select_customer ON deliveries FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM orders WHERE id = order_id)
  );

-- Staff can see all deliveries
CREATE POLICY deliveries_select_staff ON deliveries FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'STAFF'));

-- Staff can manage deliveries
CREATE POLICY deliveries_update_staff ON deliveries FOR UPDATE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'STAFF'))
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'STAFF'));

-- Riders can update their own deliveries
CREATE POLICY deliveries_update_own ON deliveries FOR UPDATE
  USING (auth.uid() = rider_id)
  WITH CHECK (auth.uid() = rider_id);

-- Admins manage all
CREATE POLICY deliveries_admin ON deliveries FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');

-- ============================================
-- INVENTORY_TRANSACTIONS RLS POLICIES
-- ============================================

-- Staff and admins can read inventory transactions
CREATE POLICY inventory_transactions_select_staff ON inventory_transactions FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'STAFF'));

-- Staff can insert transactions
CREATE POLICY inventory_transactions_insert_staff ON inventory_transactions FOR INSERT
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'STAFF'));

-- Admins can manage all
CREATE POLICY inventory_transactions_admin ON inventory_transactions FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');

-- ============================================
-- REVIEWS RLS POLICIES
-- ============================================

-- Everyone can read reviews
CREATE POLICY reviews_select_all ON reviews FOR SELECT
  USING (true);

-- Users can insert their own reviews
CREATE POLICY reviews_insert_own ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY reviews_update_own ON reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage all reviews
CREATE POLICY reviews_admin ON reviews FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');

-- ============================================
-- NOTIFICATIONS RLS POLICIES
-- ============================================

-- Users can read their own notifications
CREATE POLICY notifications_select_own ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY notifications_update_own ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage all
CREATE POLICY notifications_admin ON notifications FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');

-- ============================================
-- AUDIT_LOGS RLS POLICIES
-- ============================================

-- Only admins can read audit logs
CREATE POLICY audit_logs_select_admin ON audit_logs FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');

-- Only admins can insert audit logs (through application logic)
CREATE POLICY audit_logs_insert_admin ON audit_logs FOR INSERT
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');

-- Only admins can manage
CREATE POLICY audit_logs_admin ON audit_logs FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');
