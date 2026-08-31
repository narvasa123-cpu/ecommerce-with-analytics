import { beforeEach, describe, expect, it, vi } from 'vitest';

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabase: { rpc } }));

import { createOrderFromCart, updateOrderStatus } from './orders';

describe('checkout and order workflow boundaries', () => {
  beforeEach(() => rpc.mockReset());
  it('sends checkout details to the transactional RPC', async () => {
    rpc.mockResolvedValue({ data: { id: 'order-1', status: 'PENDING' }, error: null });
    const order = await createOrderFromCart({ addressId: 'address-1', contactNumber: '09170000000', paymentMethod: 'Cash on delivery', notes: 'Leave at gate' });
    expect(rpc).toHaveBeenCalledWith('checkout_cart', { p_delivery_address_id: 'address-1', p_contact_number: '09170000000', p_payment_method: 'Cash on delivery', p_notes: 'Leave at gate' });
    expect(order.status).toBe('PENDING');
  });
  it('normalizes failed status transitions as AppError', async () => {
    rpc.mockResolvedValue({ data: null, error: { code: '22023', message: 'Invalid transition' } });
    await expect(updateOrderStatus('order-1', 'DELIVERED')).rejects.toMatchObject({ code: '22023', message: 'Invalid transition' });
  });
});
