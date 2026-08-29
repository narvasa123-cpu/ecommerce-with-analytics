-- Seed categories
INSERT INTO categories (name, description, image_url, is_active) VALUES
  ('Electronics', 'Electronic devices and gadgets', 'https://via.placeholder.com/300x200?text=Electronics', true),
  ('Accessories', 'Cables, adapters, and accessories', 'https://via.placeholder.com/300x200?text=Accessories', true),
  ('Home & Lifestyle', 'Home and lifestyle products', 'https://via.placeholder.com/300x200?text=Home', true),
  ('Computer Accessories', 'Computer peripherals and accessories', 'https://via.placeholder.com/300x200?text=Computer', true)
ON CONFLICT (name) DO NOTHING;

-- Seed products
INSERT INTO products (category_id, sku, name, description, price, stock_quantity, minimum_stock, image_url, is_active) 
SELECT 
  (SELECT id FROM categories WHERE name = 'Electronics'),
  'ELEC-001',
  'Wireless Bluetooth Headphones',
  'Premium wireless headphones with noise cancellation and 30-hour battery life',
  1499.00,
  25,
  5,
  'https://via.placeholder.com/300x200?text=Headphones',
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'ELEC-001')
UNION ALL
SELECT 
  (SELECT id FROM categories WHERE name = 'Electronics'),
  'ELEC-002',
  'Wireless Mechanical Keyboard',
  'Mechanical keyboard with RGB lighting and wireless connectivity',
  2299.00,
  15,
  5,
  'https://via.placeholder.com/300x200?text=Keyboard',
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'ELEC-002')
UNION ALL
SELECT 
  (SELECT id FROM categories WHERE name = 'Home & Lifestyle'),
  'HOME-001',
  'Stainless Steel Water Bottle',
  'Durable stainless steel water bottle with double-wall insulation',
  599.00,
  40,
  10,
  'https://via.placeholder.com/300x200?text=Bottle',
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'HOME-001')
UNION ALL
SELECT 
  (SELECT id FROM categories WHERE name = 'Accessories'),
  'ACC-001',
  'USB-C Fast Charging Cable',
  'High-speed USB-C cable for fast charging and data transfer',
  299.00,
  50,
  10,
  'https://via.placeholder.com/300x200?text=Cable',
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'ACC-001')
UNION ALL
SELECT 
  (SELECT id FROM categories WHERE name = 'Computer Accessories'),
  'ELEC-003',
  'Wireless Computer Mouse',
  'Ergonomic wireless mouse with long battery life',
  799.00,
  20,
  5,
  'https://via.placeholder.com/300x200?text=Mouse',
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'ELEC-003');

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
