-- Keep an immutable operational trail for sensitive commerce changes.
CREATE OR REPLACE FUNCTION public.write_audit_log()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_TABLE_NAME = 'orders' AND TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, target_id, target_type, details) VALUES (auth.uid(), 'ORDER_CREATED', NEW.id, 'order', jsonb_build_object('order_number', NEW.order_number, 'status', NEW.status));
  ELSIF TG_TABLE_NAME = 'orders' AND TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit_logs (user_id, action, target_id, target_type, details) VALUES (auth.uid(), 'ORDER_STATUS_CHANGED', NEW.id, 'order', jsonb_build_object('from', OLD.status, 'to', NEW.status));
  ELSIF TG_TABLE_NAME = 'products' AND TG_OP = 'UPDATE' AND OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity THEN
    INSERT INTO audit_logs (user_id, action, target_id, target_type, details) VALUES (auth.uid(), 'INVENTORY_CHANGED', NEW.id, 'product', jsonb_build_object('from', OLD.stock_quantity, 'to', NEW.stock_quantity));
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS audit_orders ON public.orders;
CREATE TRIGGER audit_orders AFTER INSERT OR UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();
DROP TRIGGER IF EXISTS audit_products ON public.products;
CREATE TRIGGER audit_products AFTER UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();
