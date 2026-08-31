-- Complete delivery timing and rider-controlled status transitions.
ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMPTZ;
ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.transition_delivery_status(p_delivery_id UUID, p_new_status TEXT, p_notes TEXT DEFAULT NULL)
RETURNS public.deliveries
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_delivery public.deliveries; v_order public.orders; v_next_order_status TEXT;
BEGIN
  SELECT * INTO v_delivery FROM deliveries WHERE id = p_delivery_id AND rider_id = auth.uid() FOR UPDATE;
  IF v_delivery.id IS NULL THEN RAISE EXCEPTION 'Delivery not found or not assigned to you.' USING ERRCODE = '42501'; END IF;
  IF NOT ((v_delivery.status = 'ASSIGNED' AND p_new_status IN ('ACCEPTED', 'CANCELLED')) OR (v_delivery.status = 'ACCEPTED' AND p_new_status = 'PICKED_UP') OR (v_delivery.status = 'PICKED_UP' AND p_new_status = 'OUT_FOR_DELIVERY') OR (v_delivery.status = 'OUT_FOR_DELIVERY' AND p_new_status = 'DELIVERED')) THEN RAISE EXCEPTION 'Invalid delivery status transition from % to %.', v_delivery.status, p_new_status USING ERRCODE = '22023'; END IF;
  IF p_new_status = 'ACCEPTED' THEN v_delivery.accepted_at := now(); v_next_order_status := 'ASSIGNED'; END IF;
  IF p_new_status = 'PICKED_UP' THEN v_delivery.picked_up_at := now(); v_delivery.pickup_time := now(); v_next_order_status := 'PICKED_UP'; END IF;
  IF p_new_status = 'OUT_FOR_DELIVERY' THEN v_next_order_status := 'OUT_FOR_DELIVERY'; END IF;
  IF p_new_status = 'DELIVERED' THEN v_delivery.delivered_at := now(); v_delivery.delivery_time := now(); v_next_order_status := 'DELIVERED'; END IF;
  UPDATE deliveries SET status = p_new_status, accepted_at = v_delivery.accepted_at, picked_up_at = v_delivery.picked_up_at, delivered_at = v_delivery.delivered_at, pickup_time = v_delivery.pickup_time, delivery_time = v_delivery.delivery_time, notes = COALESCE(p_notes, notes), updated_at = now() WHERE id = p_delivery_id RETURNING * INTO v_delivery;
  SELECT * INTO v_order FROM orders WHERE id = v_delivery.order_id FOR UPDATE;
  IF v_order.status IS DISTINCT FROM v_next_order_status AND v_next_order_status IS NOT NULL THEN PERFORM set_config('app.order_transition', 'true', true); UPDATE orders SET status = v_next_order_status, updated_at = now() WHERE id = v_order.id; INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by, notes) VALUES (v_order.id, v_order.status, v_next_order_status, auth.uid(), p_notes); INSERT INTO notifications (user_id, type, title, message, related_id) VALUES (v_order.user_id, 'DELIVERY_STATUS', 'Delivery updated', 'Your order ' || v_order.order_number || ' is now ' || replace(lower(p_new_status), '_', ' ') || '.', v_order.id); END IF;
  RETURN v_delivery;
END;
$$;

REVOKE ALL ON FUNCTION public.transition_delivery_status(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transition_delivery_status(UUID, TEXT, TEXT) TO authenticated;
