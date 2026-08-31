import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export class AppError extends Error {
  code: string;
  details?: unknown;
  constructor(message: string, code = 'APP_ERROR', details?: unknown) { super(message); this.name = 'AppError'; this.code = code; this.details = details; }
}

export function normalizeError(error: PostgrestError | Error | unknown, fallback = 'Something went wrong. Please try again.') {
  if (error instanceof AppError) return error;
  if (error && typeof error === 'object' && 'message' in error) { const source = error as { message?: string; code?: string; details?: unknown }; return new AppError(source.message || fallback, source.code || 'SUPABASE_ERROR', source.details); }
  return new AppError(fallback);
}

export function assertData<T>(data: T | null, error: PostgrestError | null, fallback?: string): T {
  if (error) throw normalizeError(error, fallback); if (data === null) throw new AppError(fallback || 'The requested record was not found.', 'NOT_FOUND'); return data;
}

export function assertOk(error: PostgrestError | null, fallback?: string) { if (error) throw normalizeError(error, fallback); }
export function pageRange(page = 1, pageSize = 25) { const safePage = Math.max(1, page); const safeSize = Math.min(Math.max(1, pageSize), 100); return { from: (safePage - 1) * safeSize, to: safePage * safeSize - 1, page: safePage, pageSize: safeSize }; }
export function withClient(client: SupabaseClient = supabase) { return client; }
