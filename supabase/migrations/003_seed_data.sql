-- Seed categories
INSERT INTO categories (name, description, image_url, is_active) VALUES
  ('Electronics', 'Electronic devices and gadgets', NULL, true),
  ('Accessories', 'Cables, adapters, and accessories', NULL, true),
  ('Home & Lifestyle', 'Home and lifestyle products', NULL, true),
  ('Computer Accessories', 'Computer peripherals and accessories', NULL, true)
ON CONFLICT (name) DO NOTHING;

-- Seed products. Join categories by name so every row has a guaranteed
-- category_id, and upsert by SKU so this script can safely be run again.
INSERT INTO products (category_id, sku, name, description, price, stock_quantity, minimum_stock, image_url, is_active)
SELECT categories.id, seed.sku, seed.name, seed.description, seed.price, seed.stock_quantity,
  seed.minimum_stock, seed.image_url, seed.is_active
FROM (VALUES
  ('Electronics', 'ELEC-001', 'Wireless Bluetooth Headphones', 'Premium wireless headphones with noise cancellation and 30-hour battery life', 1499.00, 25, 5, '/products/headphones.svg', true),
  ('Electronics', 'ELEC-002', 'Wireless Mechanical Keyboard', 'Mechanical keyboard with RGB lighting and wireless connectivity', 2299.00, 15, 5, '/products/keyboard.svg', true),
  ('Home & Lifestyle', 'HOME-001', 'Stainless Steel Water Bottle', 'Durable stainless steel water bottle with double-wall insulation', 599.00, 40, 10, '/products/bottle.svg', true),
  ('Accessories', 'ACC-001', 'USB-C Fast Charging Cable', 'High-speed USB-C cable for fast charging and data transfer', 299.00, 50, 10, '/products/cable.svg', true),
  ('Computer Accessories', 'ELEC-003', 'Wireless Computer Mouse', 'Ergonomic wireless mouse with long battery life', 799.00, 20, 5, '/products/mouse.svg', true)
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

-- Note: Development profiles and users should be created through the Supabase Auth UI
-- or via a secure setup script. Do NOT insert raw passwords or auth data here.
-- Use the following guidance for development account creation:
--
-- Admin Account:
--   Name: Alex Santos
--   Email: admin@example.com
--   Role: ADMIN
--
-- Staff Account:
--   Name: Maria Cruz
--   Email: staff@example.com
--   Role: STAFF
--
-- Rider Account:
--   Name: Juan Dela Cruz
--   Email: rider@example.com
--   Role: RIDER
--
-- Customer Account:
--   Name: Daniel Reyes
--   Email: customer@example.com
--   Role: CUSTOMER
