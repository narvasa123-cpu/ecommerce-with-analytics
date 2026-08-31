import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';
import { assertData, assertOk, pageRange } from './base';

export async function listProducts(options: { page?: number; pageSize?: number; search?: string; activeOnly?: boolean } = {}) {
  const range = pageRange(options.page, options.pageSize); let query = supabase.from('products').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(range.from, range.to);
  if (options.activeOnly !== false) query = query.eq('is_active', true); if (options.search) query = query.ilike('name', `%${options.search}%`);
  const { data, error, count } = await query; return { data: assertData((data as Product[]) || [], error, 'Unable to load products.'), count: count || 0, page: range.page, pageSize: range.pageSize };
}
export async function getProduct(id: string) { const { data, error } = await supabase.from('products').select('*').eq('id', id).eq('is_active', true).single(); return assertData(data as Product | null, error, 'Unable to load product.'); }
export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'views_count'>) { const { data, error } = await supabase.from('products').insert(product).select().single(); return assertData(data as Product | null, error, 'Unable to create product.'); }
export async function updateProduct(id: string, changes: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>) { const { data, error } = await supabase.from('products').update(changes).eq('id', id).select().single(); return assertData(data as Product | null, error, 'Unable to update product.'); }
export async function archiveProduct(id: string) { const { error } = await supabase.from('products').update({ is_active: false }).eq('id', id); assertOk(error, 'Unable to archive product.'); }
