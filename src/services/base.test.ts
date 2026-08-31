import { describe, expect, it } from 'vitest';
import { AppError, normalizeError, pageRange } from './base';

describe('service foundation', () => {
  it('calculates safe one-indexed ranges', () => {
    expect(pageRange(2, 25)).toEqual({ from: 25, to: 49, page: 2, pageSize: 25 });
    expect(pageRange(0, 500).pageSize).toBe(100);
  });
  it('normalizes Supabase-shaped errors', () => {
    const error = normalizeError({ message: 'Denied', code: '42501' });
    expect(error).toBeInstanceOf(AppError); expect(error.code).toBe('42501'); expect(error.message).toBe('Denied');
  });
});
