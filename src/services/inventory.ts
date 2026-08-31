import { supabase } from '@/lib/supabase';
import type { InventoryTransaction, Product } from '@/types';
import { assertData, normalizeError } from './base';

export async function listLowStock() { const { data, error } = await supabase.from('products').select('*').eq('is_active', true).order('stock_quantity'); if (error) throw normalizeError(error, 'Unable to load inventory.'); return ((data || []) as Product[]).filter((product) => product.stock_quantity <= product.minimum_stock); }
export async function listInventoryTransactions(productId?: string) { let query = supabase.from('inventory_transactions').select('*').order('created_at', { ascending: false }); if (productId) query = query.eq('product_id', productId); const { data, error } = await query; return assertData((data as InventoryTransaction[]) || [], error, 'Unable to load inventory history.'); }
export async function adjustStock(productId: string, quantity: number, reason: string, type = 'ADJUSTMENT') { const { data, error } = await supabase.rpc('adjust_inventory', { p_product_id: productId, p_quantity: quantity, p_reason: reason, p_type: type }); return assertData(data as Product | null, error, 'Unable to adjust inventory.'); }
