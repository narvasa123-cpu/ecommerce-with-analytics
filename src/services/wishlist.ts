import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';
import { assertData, assertOk } from './base';

export async function listWishlist(userId: string) {
  const { data, error } = await supabase.from('wishlists').select('id, product_id, created_at, products(*)').eq('user_id', userId).order('created_at', { ascending: false });
  return assertData((data || []).map((row: any) => ({ id: row.id, product_id: row.product_id, created_at: row.created_at, product: row.products as Product })) , error, 'Unable to load wishlist.');
}
export async function addToWishlist(userId: string, productId: string) {
  const { data, error } = await supabase.from('wishlists').insert({ user_id: userId, product_id: productId }).select('id, product_id, created_at, products(*)').single();
  return assertData(data, error, 'Unable to save wishlist item.');
}
export async function removeFromWishlist(userId: string, productId: string) {
  const { error } = await supabase.from('wishlists').delete().eq('user_id', userId).eq('product_id', productId);
  assertOk(error, 'Unable to remove wishlist item.');
}
