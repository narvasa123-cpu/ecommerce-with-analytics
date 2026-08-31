import { supabase } from '@/lib/supabase';
import type { Delivery, DeliveryStatus } from '@/types';
import { assertData } from './base';

export async function listDeliveries(riderId?: string) { let query = supabase.from('deliveries').select('*, orders(*)').order('created_at', { ascending: false }); if (riderId) query = query.eq('rider_id', riderId); const { data, error } = await query; return assertData((data as Delivery[]) || [], error, 'Unable to load deliveries.'); }
export async function assignDelivery(orderId: string, riderId: string) { const { data, error } = await supabase.from('deliveries').upsert({ order_id: orderId, rider_id: riderId, status: 'ASSIGNED' }, { onConflict: 'order_id' }).select().single(); return assertData(data as Delivery | null, error, 'Unable to assign delivery.'); }
export async function updateDeliveryStatus(id: string, status: DeliveryStatus, notes?: string) { const { data, error } = await supabase.rpc('transition_delivery_status', { p_delivery_id: id, p_new_status: status, p_notes: notes || null }); return assertData(data as Delivery | null, error, 'Unable to update delivery.'); }
export async function acceptDelivery(id: string) { return updateDeliveryStatus(id, 'ACCEPTED'); }
export async function declineDelivery(id: string, notes: string) { return updateDeliveryStatus(id, 'CANCELLED', notes); }
