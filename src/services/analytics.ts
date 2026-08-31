import { supabase } from '@/lib/supabase';
import { assertData, normalizeError } from './base';

export type SalesPoint = { period: string; revenue: number; orders: number };
export async function getSalesSummary(from?: string, to?: string) { const { data, error } = await supabase.rpc('sales_summary', { p_from: from || null, p_to: to || null }); if (error) throw normalizeError(error, 'Unable to load sales summary.'); return data as { revenue: number; orders: number; average_order_value: number }; }
export async function getSalesTrend(from?: string, to?: string) { const { data, error } = await supabase.rpc('sales_trend', { p_from: from || null, p_to: to || null }); return assertData((data as SalesPoint[]) || [], error, 'Unable to load sales trend.'); }
export async function getTopProducts(from?: string, to?: string) { const { data, error } = await supabase.rpc('top_products', { p_from: from || null, p_to: to || null }); return assertData((data as Array<{ product_id: string; product_name: string; units_sold: number; revenue: number }>) || [], error, 'Unable to load top products.'); }
