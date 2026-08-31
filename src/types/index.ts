export type UserRole = 'CUSTOMER' | 'STAFF' | 'RIDER' | 'ADMIN';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  minimum_stock: number;
  image_url: string | null;
  is_active: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  street_address: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: string;
  user_id: string;
  status: 'ACTIVE' | 'ABANDONED' | 'COMPLETED';
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export type OrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY_FOR_PICKUP'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  delivery_address_id: string | null;
  contact_number: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  subtotal: number;
  created_at: string;
  product?: Product;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  previous_status: string | null;
  new_status: string;
  changed_by: string | null;
  notes: string | null;
  created_at: string;
}

export type DeliveryStatus = 'ASSIGNED' | 'ACCEPTED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export interface Delivery {
  id: string;
  order_id: string;
  rider_id: string | null;
  status: DeliveryStatus;
  pickup_time: string | null;
  delivery_time: string | null;
  accepted_at?: string | null;
  picked_up_at?: string | null;
  delivered_at?: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type InventoryTransactionType = 'RESTOCK' | 'SALE' | 'ADJUSTMENT' | 'RETURN' | 'CANCELLATION';

export interface InventoryTransaction {
  id: string;
  product_id: string;
  type: InventoryTransactionType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string | null;
  performed_by: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_item_id: string | null;
  rating: number;
  review_text: string | null;
  is_verified_purchase: boolean;
  is_approved?: boolean;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem { id: string; product_id: string; created_at: string; product: Product; }

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  target_id: string | null;
  target_type: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: Profile | null;
  error: string | null;
}

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}
