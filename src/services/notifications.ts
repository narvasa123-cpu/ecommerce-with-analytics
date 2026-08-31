import { supabase } from '@/lib/supabase';
import type { Notification } from '@/types';
import { assertData, assertOk } from './base';

export async function listNotifications(userId: string, unreadOnly = false) { let query = supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (unreadOnly) query = query.eq('is_read', false); const { data, error } = await query; return assertData((data as Notification[]) || [], error, 'Unable to load notifications.'); }
export async function markNotificationRead(id: string) { const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id); assertOk(error, 'Unable to update notification.'); }
export async function markAllNotificationsRead(userId: string) { const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false); assertOk(error, 'Unable to update notifications.'); }
export function subscribeToNotifications(userId: string, onInsert: (notification: Notification) => void, onUpdate?: (notification: Notification) => void) { const channel = supabase.channel(`notifications:${userId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => onInsert(payload.new as Notification)).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => onUpdate?.(payload.new as Notification)).subscribe(); return () => { void supabase.removeChannel(channel); }; }
