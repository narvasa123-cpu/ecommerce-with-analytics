-- Server-side reporting functions and query indexes.
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_rider_status ON public.deliveries(rider_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created_at ON public.notifications(user_id, is_read, created_at DESC);

CREATE OR REPLACE FUNCTION public.sales_summary(p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE(revenue NUMERIC, orders BIGINT, average_order_value NUMERIC)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.current_user_role() NOT IN ('ADMIN', 'STAFF') THEN RAISE EXCEPTION 'Analytics access denied.' USING ERRCODE = '42501'; END IF;
  RETURN QUERY SELECT COALESCE(SUM(o.total), 0)::NUMERIC, COUNT(*)::BIGINT, COALESCE(AVG(o.total), 0)::NUMERIC FROM orders o WHERE o.status = 'DELIVERED' AND (p_from IS NULL OR o.created_at >= p_from) AND (p_to IS NULL OR o.created_at < p_to);
END;
$$;

CREATE OR REPLACE FUNCTION public.sales_trend(p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE(period TEXT, revenue NUMERIC, orders BIGINT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.current_user_role() NOT IN ('ADMIN', 'STAFF') THEN RAISE EXCEPTION 'Analytics access denied.' USING ERRCODE = '42501'; END IF;
  RETURN QUERY SELECT to_char(date_trunc('day', o.created_at), 'Mon DD')::TEXT, SUM(o.total)::NUMERIC, COUNT(*)::BIGINT FROM orders o WHERE o.status = 'DELIVERED' AND (p_from IS NULL OR o.created_at >= p_from) AND (p_to IS NULL OR o.created_at < p_to) GROUP BY date_trunc('day', o.created_at) ORDER BY date_trunc('day', o.created_at);
END;
$$;

CREATE OR REPLACE FUNCTION public.top_products(p_from TIMESTAMPTZ DEFAULT NULL, p_to TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE(product_id UUID, product_name TEXT, units_sold BIGINT, revenue NUMERIC)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.current_user_role() NOT IN ('ADMIN', 'STAFF') THEN RAISE EXCEPTION 'Analytics access denied.' USING ERRCODE = '42501'; END IF;
  RETURN QUERY SELECT p.id, p.name, SUM(oi.quantity)::BIGINT, SUM(oi.subtotal)::NUMERIC FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id WHERE o.status = 'DELIVERED' AND (p_from IS NULL OR o.created_at >= p_from) AND (p_to IS NULL OR o.created_at < p_to) GROUP BY p.id, p.name ORDER BY SUM(oi.subtotal) DESC LIMIT 10;
END;
$$;

REVOKE ALL ON FUNCTION public.sales_summary(TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sales_summary(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
REVOKE ALL ON FUNCTION public.sales_trend(TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sales_trend(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
REVOKE ALL ON FUNCTION public.top_products(TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.top_products(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
