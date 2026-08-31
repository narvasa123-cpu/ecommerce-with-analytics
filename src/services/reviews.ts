import { supabase } from '@/lib/supabase';
import type { Review } from '@/types';
import { assertData, assertOk } from './base';

export async function listProductReviews(productId: string) { const { data, error } = await supabase.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false }); return assertData((data as Review[]) || [], error, 'Unable to load reviews.'); }
export async function listAllReviews() { const { data, error } = await supabase.from('reviews').select('*, products(name)').order('created_at', { ascending: false }); return assertData((data || []) as Review[], error, 'Unable to load review moderation queue.'); }
export async function createReview(input: { productId: string; userId: string; rating: number; text: string }) { const { data, error } = await supabase.from('reviews').insert({ product_id: input.productId, user_id: input.userId, rating: input.rating, review_text: input.text || null }).select().single(); return assertData(data as Review | null, error, 'Unable to submit review.'); }
export async function moderateReview(id: string, isApproved: boolean) { const { data, error } = await supabase.from('reviews').update({ is_approved: isApproved }).eq('id', id).select().single(); return assertData(data as Review | null, error, 'Unable to update review.'); }
export async function deleteReview(id: string) { const { error } = await supabase.from('reviews').delete().eq('id', id); assertOk(error, 'Unable to delete review.'); }
