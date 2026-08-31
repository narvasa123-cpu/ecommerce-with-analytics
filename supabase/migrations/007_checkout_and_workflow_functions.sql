-- Transactional commerce primitives.
-- Apply after migrations 001-006. These functions are deliberately SECURITY DEFINER:
-- the client may request a checkout, but it must not be able to split the operation
-- into separately writable order, stock, and notification records.

CREATE OR REPLACE FUNCTION public.checkout_cart(
  p_delivery_address_id UUID,
  p_contact_number TEXT,
  p_payment_method TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_cart_id UUID;
  v_order public.orders;
  v_item RECORD;
  v_subtotal NUMERIC(10,2) := 0;
  v_delivery_fee NUMERIC(10,2) := 0;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'You must be signed in to checkout.' USING ERRCODE = '28000'; END IF;
  IF p_contact_number IS NULL OR length(trim(p_contact_number)) < 7 THEN RAISE EXCEPTION 'A valid contact number is required.' USING ERRCODE = '22023'; END IF;
  IF NOT EXISTS (SELECT 1 FROM addresses WHERE id = p_delivery_address_id AND user_id = v_user_id) THEN RAISE EXCEPTION 'The selected delivery address is invalid.' USING ERRCODE = '23503'; END IF;

  SELECT id INTO v_cart_id FROM carts WHERE user_id = v_user_id AND status = 'ACTIVE' FOR UPDATE;
  IF v_cart_id IS NULL THEN RAISE EXCEPTION 'Your cart is empty.' USING ERRCODE = 'P0001'; END IF;
  IF NOT EXISTS (SELECT 1 FROM cart_items WHERE cart_id = v_cart_id) THEN RAISE EXCEPTION 'Your cart is empty.' USING ERRCODE = 'P0001'; END IF;

  -- Lock each product row before checking stock. Concurrent checkouts cannot oversell.
  FOR v_item IN
    SELECT ci.product_id, ci.quantity, p.name, p.price, p.stock_quantity
    FROM cart_items ci JOIN products p ON p.id = ci.product_id
    WHERE ci.cart_id = v_cart_id AND p.is_active = true
    FOR UPDATE OF p
  LOOP
    IF v_item.quantity > v_item.stock_quantity THEN RAISE EXCEPTION 'Not enough stock for %.', v_item.name USING ERRCODE = '23514'; END IF;
    v_subtotal := v_subtotal + (v_item.price * v_item.quantity);
  END LOOP;

  IF v_subtotal = 0 THEN RAISE EXCEPTION 'No active products are available in your cart.' USING ERRCODE = 'P0001'; END IF;
  INSERT INTO orders (order_number, user_id, delivery_address_id, contact_number, status, subtotal, delivery_fee, discount, total, payment_method, notes)
  VALUES ('EC-' || to_char(clock_timestamp(), 'YYMMDDHH24MISS') || '-' || upper(substr(replace(uuid_generate_v4()::TEXT, '-', ''), 1, 6)), v_user_id, p_delivery_address_id, trim(p_contact_number), 'PENDING', v_subtotal, v_delivery_fee, 0, v_subtotal + v_delivery_fee, p_payment_method, p_notes)
  RETURNING * INTO v_order;

  FOR v_item IN
    SELECT ci.product_id, ci.quantity, p.price, p.stock_quantity
    FROM cart_items ci JOIN products p ON p.id = ci.product_id
    WHERE ci.cart_id = v_cart_id
    FOR UPDATE OF p
  LOOP
    INSERT INTO order_items (order_id, product_id, quantity, price, subtotal)
    VALUES (v_order.id, v_item.product_id, v_item.quantity, v_item.price, v_item.price * v_item.quantity);
    UPDATE products SET stock_quantity = stock_quantity - v_item.quantity, updated_at = now() WHERE id = v_item.product_id;
    INSERT INTO inventory_transactions (product_id, type, quantity, previous_stock, new_stock, reason, performed_by)
    VALUES (v_item.product_id, 'SALE', -v_item.quantity, v_item.stock_quantity, v_item.stock_quantity - v_item.quantity, 'Checkout order ' || v_order.order_number, v_user_id);
  END LOOP;
  UPDATE carts SET status = 'COMPLETED', updated_at = now() WHERE id = v_cart_id;
  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (v_user_id, 'ORDER_CREATED', 'Order received', 'Your order ' || v_order.order_number || ' has been placed successfully.', v_order.id);
  RETURN v_order;
END;
$$;

CREATE OR REPLACE FUNCTION public.transition_order_status(p_order_id UUID, p_new_status TEXT, p_notes TEXT DEFAULT NULL)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders;
  v_previous_status TEXT;
  v_role TEXT := public.current_user_role();
  v_allowed BOOLEAN := false;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
  IF v_order.id IS NULL THEN RAISE EXCEPTION 'Order not found.' USING ERRCODE = 'P0002'; END IF;
  IF v_role IS NULL THEN RAISE EXCEPTION 'You must be signed in.' USING ERRCODE = '28000'; END IF;
  IF v_role = 'CUSTOMER' THEN
    v_allowed := v_order.user_id = auth.uid() AND v_order.status IN ('PENDING', 'CONFIRMED') AND p_new_status = 'CANCELLED';
  ELSE
    v_allowed := v_role IN ('ADMIN', 'STAFF') AND (
      (v_order.status = 'PENDING' AND p_new_status IN ('CONFIRMED', 'CANCELLED')) OR
      (v_order.status = 'CONFIRMED' AND p_new_status IN ('PROCESSING', 'CANCELLED')) OR
      (v_order.status = 'PROCESSING' AND p_new_status IN ('READY_FOR_PICKUP', 'CANCELLED')) OR
      (v_order.status = 'READY_FOR_PICKUP' AND p_new_status IN ('ASSIGNED', 'CANCELLED')) OR
      (v_order.status = 'ASSIGNED' AND p_new_status IN ('PICKED_UP', 'CANCELLED')) OR
      (v_order.status = 'PICKED_UP' AND p_new_status = 'OUT_FOR_DELIVERY') OR
      (v_order.status = 'OUT_FOR_DELIVERY' AND p_new_status = 'DELIVERED')
    );
  END IF;
  IF NOT v_allowed THEN RAISE EXCEPTION 'Invalid order status transition from % to %.', v_order.status, p_new_status USING ERRCODE = '22023'; END IF;
  v_previous_status := v_order.status;
  PERFORM set_config('app.order_transition', 'true', true);
  UPDATE orders SET status = p_new_status, notes = COALESCE(p_notes, notes), updated_at = now() WHERE id = p_order_id RETURNING * INTO v_order;
  INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by, notes) VALUES (p_order_id, v_previous_status, p_new_status, auth.uid(), p_notes);
  INSERT INTO notifications (user_id, type, title, message, related_id) VALUES (v_order.user_id, 'ORDER_STATUS', 'Order status updated', 'Order ' || v_order.order_number || ' is now ' || replace(lower(p_new_status), '_', ' ') || '.', v_order.id);
  RETURN v_order;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_direct_order_status_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND current_setting('app.order_transition', true) IS DISTINCT FROM 'true' THEN
    RAISE EXCEPTION 'Order status must be changed through the workflow.' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS enforce_order_status_workflow ON public.orders;
CREATE TRIGGER enforce_order_status_workflow BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.prevent_direct_order_status_change();

CREATE OR REPLACE FUNCTION public.adjust_inventory(p_product_id UUID, p_quantity INTEGER, p_reason TEXT, p_type TEXT DEFAULT 'ADJUSTMENT')
RETURNS public.products
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_product public.products; v_role TEXT := public.current_user_role();
BEGIN
  IF v_role NOT IN ('ADMIN', 'STAFF') THEN RAISE EXCEPTION 'Only staff can adjust inventory.' USING ERRCODE = '42501'; END IF;
  IF p_quantity = 0 THEN RAISE EXCEPTION 'Inventory adjustment cannot be zero.' USING ERRCODE = '22023'; END IF;
  SELECT * INTO v_product FROM products WHERE id = p_product_id FOR UPDATE;
  IF v_product.id IS NULL THEN RAISE EXCEPTION 'Product not found.' USING ERRCODE = 'P0002'; END IF;
  IF v_product.stock_quantity + p_quantity < 0 THEN RAISE EXCEPTION 'Inventory cannot become negative.' USING ERRCODE = '23514'; END IF;
  UPDATE products SET stock_quantity = stock_quantity + p_quantity, updated_at = now() WHERE id = p_product_id RETURNING * INTO v_product;
  INSERT INTO inventory_transactions (product_id, type, quantity, previous_stock, new_stock, reason, performed_by) VALUES (p_product_id, p_type, p_quantity, v_product.stock_quantity - p_quantity, v_product.stock_quantity, p_reason, auth.uid());
  RETURN v_product;
END;
$$;

REVOKE ALL ON FUNCTION public.checkout_cart(UUID, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.checkout_cart(UUID, TEXT, TEXT, TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.transition_order_status(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transition_order_status(UUID, TEXT, TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.adjust_inventory(UUID, INTEGER, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.adjust_inventory(UUID, INTEGER, TEXT, TEXT) TO authenticated;
