import { supabase } from '@/lib/supabase';
import type { AuditLog } from '@/types';
import { assertData } from './base';

export async function listAuditLogs(limit = 100) { const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(limit); return assertData((data as AuditLog[]) || [], error, 'Unable to load audit logs.'); }
