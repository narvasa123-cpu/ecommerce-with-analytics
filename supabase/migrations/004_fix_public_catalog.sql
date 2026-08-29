-- Existing databases may already have 002_rls_policies.sql applied.
-- Its staff product policy queries profiles, while profiles has an admin
-- policy that queries profiles again. PostgreSQL detects that as recursion.
-- Active products are intentionally public, so the staff policy is not needed
-- for the storefront and must be removed from the recursive read path.
DROP POLICY IF EXISTS products_select_staff ON products;

-- Re-run the corrected seed for projects where 003 was already applied.
INSERT INTO categories (name, description, image_url, is_active) VALUES
  ('Electronics', 'Electronic devices and gadgets', 'https://via.placeholder.com/300x200?text=Electronics', true),
  ('Accessories', 'Cables, adapters, and accessories', 'https://via.placeholder.com/300x200?text=Accessories', true),
  ('Home & Lifestyle', 'Home and lifestyle products', 'https://via.placeholder.com/300x200?text=Home', true),
  ('Computer Accessories', 'Computer peripherals and accessories', 'https://via.placeholder.com/300x200?text=Computer', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO products (category_id, sku, name, description, price, stock_quantity, minimum_stock, image_url, is_active)
SELECT categories.id, seed.sku, seed.name, seed.description, seed.price, seed.stock_quantity,
  seed.minimum_stock, seed.image_url, seed.is_active
FROM (VALUES
  ('Electronics', 'ELEC-001', 'Wireless Bluetooth Headphones', 'Premium wireless headphones with noise cancellation and 30-hour battery life', 1499.00, 25, 5, 'https://via.placeholder.com/300x200?text=Headphones', true),
  ('Electronics', 'ELEC-002', 'Wireless Mechanical Keyboard', 'Mechanical keyboard with RGB lighting and wireless connectivity', 2299.00, 15, 5, 'https://via.placeholder.com/300x200?text=Keyboard', true),
  ('Home & Lifestyle', 'HOME-001', 'Stainless Steel Water Bottle', 'Durable stainless steel water bottle with double-wall insulation', 599.00, 40, 10, 'https://via.placeholder.com/300x200?text=Bottle', true),
  ('Accessories', 'ACC-001', 'USB-C Fast Charging Cable', 'High-speed USB-C cable for fast charging and data transfer', 299.00, 50, 10, 'https://via.placeholder.com/300x200?text=Cable', true),
  ('Computer Accessories', 'ELEC-003', 'Wireless Computer Mouse', 'Ergonomic wireless mouse with long battery life', 799.00, 20, 5, 'https://via.placeholder.com/300x200?text=Mouse', true)
) AS seed(category_name, sku, name, description, price, stock_quantity, minimum_stock, image_url, is_active)
JOIN categories ON categories.name = seed.category_name
ON CONFLICT (sku) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  minimum_stock = EXCLUDED.minimum_stock,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active;
