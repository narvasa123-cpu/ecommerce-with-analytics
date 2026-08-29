import { useEffect, useState } from 'react';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { CartItem, Product } from '@/types';
import { formatCurrency } from '@/lib/auth';

type CartRow = CartItem & { product: Product };

export default function CustomerCart() {
  const [items, setItems] = useState<CartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError('');
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { setLoading(false); return; }
    const { data: cart, error: cartError } = await supabase.from('carts').select('id').eq('user_id', auth.user.id).eq('status', 'ACTIVE').maybeSingle();
    if (cartError) { setError(cartError.message); setLoading(false); return; }
    if (!cart) { setItems([]); setLoading(false); return; }
    const { data: rows, error: itemError } = await supabase.from('cart_items').select('*').eq('cart_id', cart.id).order('created_at');
    if (itemError) { setError(itemError.message); setLoading(false); return; }
    const productIds = (rows ?? []).map((row) => row.product_id);
    const productResult = productIds.length ? await supabase.from('products').select('*').in('id', productIds) : { data: [], error: null };
    if (productResult.error) setError(productResult.error.message);
    const lookup = new Map((productResult.data as Product[] ?? []).map((product) => [product.id, product]));
    setItems((rows ?? []).map((row) => ({ ...row, product: lookup.get(row.product_id) })).filter((row): row is CartRow => Boolean(row.product)));
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const updateQuantity = async (item: CartRow, quantity: number) => {
    if (quantity < 1 || quantity > item.product.stock_quantity) return;
    setSaving(item.id);
    const { error: updateError } = await supabase.from('cart_items').update({ quantity, price_at_time: item.product.price }).eq('id', item.id);
    if (updateError) setError(updateError.message); else setItems((current) => current.map((row) => row.id === item.id ? { ...row, quantity, price_at_time: item.product.price } : row));
    setSaving(null);
  };

  const removeItem = async (item: CartRow) => {
    setSaving(item.id);
    const { error: deleteError } = await supabase.from('cart_items').delete().eq('id', item.id);
    if (deleteError) setError(deleteError.message); else setItems((current) => current.filter((row) => row.id !== item.id));
    setSaving(null);
  };

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Your bag</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Shopping cart</h1><p className="mt-1 text-slate-500">Prices and availability are refreshed from the catalog.</p></div>{error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}{loading ? <div className="flex min-h-64 items-center justify-center text-slate-500">Loading cart…</div> : items.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><ShoppingBag className="mx-auto text-slate-300" size={40} /><h2 className="mt-4 font-semibold text-slate-900">Your cart is empty</h2><p className="mt-1 text-sm text-slate-500">Browse products and add something you like.</p></div> : <div className="grid gap-5 lg:grid-cols-[1fr_360px]"><section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="divide-y divide-slate-100">{items.map((item) => <article key={item.id} className="flex flex-wrap items-center gap-4 p-5 sm:flex-nowrap"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">{item.product.image_url ? <img src={item.product.image_url} alt={item.product.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-slate-400">No image</div>}</div><div className="min-w-0 flex-1"><h2 className="font-semibold text-slate-900">{item.product.name}</h2><p className="mt-1 text-sm text-slate-500">{formatCurrency(item.product.price)} each · {item.product.stock_quantity} available</p></div><div className="flex items-center gap-2"><button disabled={saving === item.id || item.quantity <= 1} onClick={() => void updateQuantity(item, item.quantity - 1)} aria-label={`Decrease ${item.product.name}`} className="h-10 w-10 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40"><Minus size={16} className="mx-auto" /></button><span className="w-8 text-center font-semibold">{item.quantity}</span><button disabled={saving === item.id || item.quantity >= item.product.stock_quantity} onClick={() => void updateQuantity(item, item.quantity + 1)} aria-label={`Increase ${item.product.name}`} className="h-10 w-10 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40"><Plus size={16} className="mx-auto" /></button></div><p className="w-28 text-right font-bold text-slate-900">{formatCurrency(item.product.price * item.quantity)}</p><button disabled={saving === item.id} onClick={() => void removeItem(item)} aria-label={`Remove ${item.product.name}`} className="h-10 w-10 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={17} className="mx-auto" /></button></article>)}</div></section><aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-900">Order summary</h2><div className="mt-5 flex justify-between text-sm text-slate-500"><span>Subtotal</span><span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span></div><div className="mt-3 flex justify-between text-sm text-slate-500"><span>Delivery fee</span><span>Calculated at checkout</span></div><div className="my-5 border-t border-slate-100" /><div className="flex justify-between"><span className="font-semibold text-slate-900">Estimated total</span><span className="text-xl font-bold text-slate-900">{formatCurrency(subtotal)}</span></div><p className="mt-4 text-xs leading-5 text-slate-500">Checkout requires a delivery address and payment method.</p></aside></div>}</div>;
}
