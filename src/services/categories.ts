import { supabase } from '@/lib/supabase';
import type { Category } from '@/types';
import { assertData, assertOk } from './base';

export async function listCategories(activeOnly = true) { let query = supabase.from('categories').select('*').order('name'); if (activeOnly) query = query.eq('is_active', true); const { data, error } = await query; return assertData((data as Category[]) || [], error, 'Unable to load categories.'); }
export async function getCategory(id: string) { const { data, error } = await supabase.from('categories').select('*').eq('id', id).single(); return assertData(data as Category | null, error, 'Unable to load category.'); }
export async function updateCategory(id: string, changes: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>) { const { data, error } = await supabase.from('categories').update(changes).eq('id', id).select().single(); return assertData(data as Category | null, error, 'Unable to update category.'); }
export async function archiveCategory(id: string) { const { error } = await supabase.from('categories').update({ is_active: false }).eq('id', id); assertOk(error, 'Unable to archive category.'); }
